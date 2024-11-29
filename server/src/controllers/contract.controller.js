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
    await redis.set(fileKey, req.file.buffer, "EX", 3600); // Expire in 1 hour

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
    await redis.set(fileKey, req.file.buffer, "EX", 3600); // Expire in 1 hour

    const pdfText = await extractTextFromPDF(fileKey);
    let analysis;

    if (user.isPremium) {
      analysis = await analyzeContractWithAI(pdfText, "premium", contractType);
    } else {
      analysis = await analyzeContractWithAI(pdfText, "free", contractType);
    }

    if (!analysis.summary || !analysis.risks || !analysis.opportunities) {
      throw new Error("Failed to analyze contract");
    }

    // Save analysis using Prisma
    const savedAnalysis = await prisma.contractAnalysis.create({
      data: {
        userId: user.id,
        contractText: pdfText,
        contractType,
        ...analysis,
        language: "en",
        aiModel: "gemini-pro",
      },
    });

    res.json(savedAnalysis);
  } catch (error) {
    console.error(error);
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
    const cachedContract = await redis.get(`contract:${id}`);
    if (cachedContract) {
      return res.json(JSON.parse(cachedContract));
    }

    const contract = await prisma.contractAnalysis.findFirst({
      where: {
        id: parseInt(id, 10), // Adjust based on your ID type
        userId: user.id,
      },
    });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    await redis.set(`contract:${id}`, JSON.stringify(contract), "EX", 3600); // Cache for 1 hour

    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get contract" });
  }
}
