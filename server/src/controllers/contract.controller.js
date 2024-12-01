import multer from "multer";
import redis from "../config/redis.js";
import {
  analyzeContractWithAI,
  detectContractType,
  extractTextFromPDF,
} from "../services/ai.services.js";
import { PrismaClient } from "@prisma/client";
import { isValidId } from "../utils/dbUtils.js";

const prisma = new PrismaClient();

// Multer middleware for handling PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only PDF files are allowed"));
    }
  },
}).single("contract");

export const uploadMiddleware = upload;

// Detect and confirm contract type
export async function detectAndConfirmContractType(req, res) {
  const user = req.user;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileKey = `file:${user.id}:${Date.now()}`;
    await redis.set(fileKey, req.file.buffer, { ex: 3600 }); // Correct usage

    const pdfText = await extractTextFromPDF(fileKey);
    const detectedType = await detectContractType(pdfText);

    await redis.del(fileKey);

    res.json({ detectedType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to detect contract type" });
  }
}

// Analyze a contract
export async function analyzeContract(req, res) {
  const user = req.user;
  const { contractType } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!contractType) {
    return res.status(400).json({ error: "No contract type provided" });
  }

  try {
    const fileKey = `file:${user.id}:${Date.now()}`;
    await redis.set(fileKey, req.file.buffer, { ex: 3600 });

    const pdfText = await extractTextFromPDF(fileKey);

    const analysis = await analyzeContractWithAI(
      pdfText,
      user.isPremium ? "premium" : "free",
      contractType
    );

    const risksData = analysis.risks
      ? analysis.risks.map((risk) => ({
        risk: risk.risk,
        explanation: risk.explanation,
        severity: risk.severity || "medium", // Default severity if not provided
      }))
      : [];

    const opportunitiesData = analysis.opportunities
      ? analysis.opportunities.map((opportunity) => ({
        opportunity: opportunity.opportunity,
        explanation: opportunity.explanation,
        impact: opportunity.impact || "medium", // Default impact if not provided
      }))
      : [];

    // Validate and handle expiration date
    let expirationDate = null;
    if (analysis.expirationDate) {
      const parsedDate = new Date(analysis.expirationDate);
      if (!isNaN(parsedDate.getTime())) {
        expirationDate = parsedDate; // Valid date
      }
    }

    // Sanitize contractDuration
    const sanitizeContractDuration = (duration) => {
      if (!duration || typeof duration !== "string") return null; // Return null if undefined or invalid
      if (duration.toLowerCase().includes("indefinite")) return null; // Handle "Indefinite period"
      const parsedDuration = parseFloat(duration);
      return isNaN(parsedDuration) ? null : parsedDuration;
    };

    // Sanitize overallScore
    const sanitizeOverallScore = (score) => {
      if (score === null || score === undefined) return null; // Return null if not provided
      const parsedScore = parseFloat(score);
      return isNaN(parsedScore) ? null : parsedScore;
    };


    const savedAnalysis = await prisma.contractAnalysis.create({
      data: {
        userId: user.id,
        contractText: pdfText,
        contractType,
        risks: {
          create: risksData,
        },
        opportunities: {
          create: opportunitiesData,
        },
        summary: analysis.summary || "No summary available.",
        recommendations: analysis.recommendations || [],
        keyClauses: analysis.keyClauses || [],
        negotiationPoints: analysis.negotiationPoints || [],
        performanceMetrics: analysis.performanceMetrics || [],
        intellectualPropertyClauses: analysis.intellectualPropertyClauses || [],
        customFields: analysis.customFields || [],
        //overallScore: analysis.overallScore || null, // Ensured to be Float or null
        overallScore: sanitizeOverallScore(analysis.overallScore), // Sanitized overallScore
        legalCompliance: analysis.legalCompliance || null,
        //contractDuration: analysis.contractDuration || null,
        contractDuration: sanitizeContractDuration(analysis.contractDuration), // Sanitized contractDuration
        terminationConditions: analysis.terminationConditions || [],
        expirationDate: expirationDate,
        language: "en",
        aiModel: "gemini-pro",
      },
      include: {
        risks: true, // Include related risks
        opportunities: true, // Include related opportunities
      },
    });

    console.log("Saved analysis:", savedAnalysis);

    res.json(savedAnalysis);
  } catch (error) {
    console.error("Error analyzing contract:", error);
    res.status(500).json({ error: "Failed to analyze contract" });
  }
}




// Get user contracts
export async function getUserContracts(req, res) {
  const user = req.user;

  try {
    const contracts = await prisma.contractAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get contracts" });
  }
}

// Get a specific contract by ID
export async function getContractByID(req, res) {
  const { id } = req.params;
  const user = req.user;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid contract ID" });
  }

  try {
    // Fetch from Redis
    const cachedContract = await redis.get(`contract:${id}`);
    if (cachedContract) {
      try {
        const parsedContract =
          typeof cachedContract === "string"
            ? JSON.parse(cachedContract)
            : cachedContract;
        return res.json(parsedContract);
      } catch (e) {
        console.error("Invalid JSON in Redis:", cachedContract, e);
        await redis.del(`contract:${id}`); // Remove corrupted cache
      }
    }

    // Fetch from Database
    const contract = await prisma.contractAnalysis.findFirst({
      where: {
        id: parseInt(id, 10),
        userId: user.id,
      },
      include: {
        risks: true, // Include related risks
        opportunities: true, // Include related opportunities
      },
    });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Save to Redis
    await redis.set(`contract:${id}`, JSON.stringify(contract), { ex: 3600 });

    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get contract" });
  }
}
