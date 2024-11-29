import redis from "../config/redis.js";
import pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const { getDocument, GlobalWorkerOptions } = pdfjs;

// Configure the PDF.js worker
GlobalWorkerOptions.workerSrc = "./pdf.worker.js";
const STANDARD_FONT_DATA_URL = "./fonts/";

// Configure the Google Generative AI
const AI_MODEL = "gemini-pro";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

/**
 * Extract text from a PDF stored in Redis
 */
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

    const pdf = await getDocument({
      data: fileBuffer,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    }).promise;

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

/**
 * Detect contract type using Google Generative AI
 */
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

    // Ensure `response.text` is invoked to get the text content
    const responseText = typeof response.text === "function" ? await response.text() : null;

    if (typeof responseText !== "string") {
      console.error("Unexpected response format:", results);
      throw new Error("Expected response.text to be a string");
    }

    return responseText.trim();
  } catch (error) {
    console.error("Error detecting contract type:", error);
    throw error;
  }
}

/**
 * Analyze a contract with AI based on user tier
 */
export async function analyzeContractWithAI(contractText, tier, contractType) {
  let prompt;
  if (tier === "premium") {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    {
      "risks": [{"risk": "Risk description", "explanation": "Brief explanation", "severity": "low|medium|high"}],
      "opportunities": [{"opportunity": "Opportunity description", "explanation": "Brief explanation", "impact": "low|medium|high"}],
      "summary": "Comprehensive summary of the contract",
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "keyClauses": ["Clause 1", "Clause 2", ...],
      "overallScore": "Overall score from 1 to 100"
    }

    Contract text:
    ${contractText}
    `;
  } else {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    {
      "risks": [{"risk": "Risk description", "explanation": "Brief explanation"}],
      "opportunities": [{"opportunity": "Opportunity description", "explanation": "Brief explanation"}],
      "summary": "Brief summary of the contract",
      "recommendations": [],
      "overallScore": "Overall score from 1 to 100"
    }

    Contract text:
    ${contractText}
    `;
  }

  try {
    const results = await aiModel.generateContent(prompt);
    const responseText = typeof results.response?.text === "function" ? await results.response.text() : null;

    if (!responseText || typeof responseText !== "string") {
      console.error("Unexpected response format:", results);
      throw new Error("Expected response.text to be a valid JSON string");
    }

    const sanitizedText = responseText.replace(/```json|```/g, "").trim();

    // Parse JSON and ensure recommendations exist
    const parsedResponse = JSON.parse(sanitizedText);
    parsedResponse.recommendations = parsedResponse.recommendations || []; // Default to an empty array if missing

    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw error;
  }
}
