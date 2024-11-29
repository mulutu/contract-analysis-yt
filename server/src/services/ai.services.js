import redis from "../config/redis.js";
//import { getDocument } from "pdfjs-dist";
//import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import pdfjs from "pdfjs-dist/legacy/build/pdf.js";
const { getDocument } = pdfjs;

/*import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const { getDocument } = pdfjs;
*/

import { GoogleGenerativeAI } from "@google/generative-ai";

const AI_MODEL = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

export async function extractTextFromPDF(fileKey) {
  try {
    const fileData = await redis.get(fileKey);
    if (!fileData) {
      throw new Error("File not found");
    }

    let fileBuffer;
    if (Buffer.isBuffer(fileData)) {
      fileBuffer = new Uint8Array(fileData);
    } else if (typeof fileData === "object" && fileData !== null) {
      const bufferData = fileData;
      if (bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
        fileBuffer = new Uint8Array(bufferData.data);
      } else {
        throw new Error("Invalid file data");
      }
    } else {
      throw new Error("Invalid file data");
    }

    const pdf = await getDocument({ data: fileBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to extract text from PDF. Error: ${JSON.stringify(error)}`);
  }
}

export async function detectContractType(contractText) {
  const prompt = `
    Analyze the following contract text and determine the type of contract it is.
    Provide only the contract type as a single string (e.g., "Employment", "Non-Disclosure Agreement", "Sales", "Lease", etc.).
    Do not include any additional explanation or text.

    Contract text:
    ${contractText.substring(0, 2000)}
  `;

  try {
    const results = await aiModel.generateContent(prompt);
    const response = results.response;
    return response.text.trim();
  } catch (error) {
    console.error("Error detecting contract type:", error);
    throw error;
  }
}

export async function analyzeContractWithAI(contractText, tier, contractType) {
  let prompt;
  if (tier === "premium") {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    1. A list of at least 10 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
    2. A list of at least 10 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
    3. A comprehensive summary of the contract, including key terms and conditions.
    4. Any recommendations for improving the contract from the receiving party's perspective.
    5. A list of key clauses in the contract.
    6. An assessment of the contract's legal compliance.
    7. A list of potential negotiation points.
    8. The contract duration or term, if applicable.
    9. A summary of termination conditions, if applicable.
    10. A breakdown of any financial terms or compensation structure, if applicable.
    11. Any performance metrics or KPIs mentioned, if applicable.
    12. A summary of any specific clauses relevant to this type of contract (e.g., intellectual property for employment contracts, warranties for sales contracts).
    13. An overall score from 1 to 100, with 100 being the highest. This score represents the overall favorability of the contract based on the identified risks and opportunities.

    Format your response as a JSON object with the following structure:
    {
      "risks": [{"risk": "Risk description", "explanation": "Brief explanation", "severity": "low|medium|high"}],
      "opportunities": [{"opportunity": "Opportunity description", "explanation": "Brief explanation", "impact": "low|medium|high"}],
      "summary": "Comprehensive summary of the contract",
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "keyClauses": ["Clause 1", "Clause 2", ...],
      "legalCompliance": "Assessment of legal compliance",
      "negotiationPoints": ["Point 1", "Point 2", ...],
      "contractDuration": "Duration of the contract, if applicable",
      "terminationConditions": "Summary of termination conditions, if applicable",
      "overallScore": "Overall score from 1 to 100",
      "financialTerms": {
        "description": "Overview of financial terms",
        "details": ["Detail 1", "Detail 2", ...]
      },
      "performanceMetrics": ["Metric 1", "Metric 2", ...],
      "specificClauses": "Summary of clauses specific to this contract type"
    }
      `;
  } else {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    1. A list of at least 5 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
    2. A list of at least 5 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
    3. A brief summary of the contract
    4. An overall score from 1 to 100, with 100 being the highest. This score represents the overall favorability of the contract based on the identified risks and opportunities.

     {
      "risks": [{"risk": "Risk description", "explanation": "Brief explanation"}],
      "opportunities": [{"opportunity": "Opportunity description", "explanation": "Brief explanation"}],
      "summary": "Brief summary of the contract",
      "overallScore": "Overall score from 1 to 100"
    }
`;
  }

  prompt += `
    Important: Provide only the JSON object in your response, without any additional text or formatting. 
    
    Contract text:
    ${contractText}
    `;

  try {
    const results = await aiModel.generateContent(prompt);
    const response = results.response.text;
    return JSON.parse(response);
  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw error;
  }
}
