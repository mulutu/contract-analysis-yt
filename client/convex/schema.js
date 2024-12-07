import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users Collection
  users: defineTable({
    googleId: v.string(),
    email: v.string(),
    displayName: v.string(),
    profilePicture: v.optional(v.string()),
    isPremium: v.boolean(),
  })
    .index("googleId_unique", ["googleId"], { unique: true })
    .index("email_unique", ["email"], { unique: true }),

  // ContractAnalyses Collection
  contractAnalyses: defineTable({
    userId: v.id("users"),
    contractText: v.string(),
    summary: v.string(),
    recommendations: v.optional(v.any()),
    keyClauses: v.optional(v.any()),
    negotiationPoints: v.optional(v.any()),
    terminationConditions: v.optional(v.any()),
    performanceMetrics: v.optional(v.any()),
    intellectualPropertyClauses: v.optional(v.any()),
    customFields: v.optional(v.any()),
    legalCompliance: v.optional(v.string()),
    contractDuration: v.optional(v.number()),
    overallScore: v.optional(v.number()),
    compensationStructureId: v.optional(v.id("compensationStructures")),
    userFeedbackId: v.optional(v.id("userFeedbacks")),
    financialTermsId: v.optional(v.id("financialTerms")),
    createdAt: v.number(), // Unix timestamp handled in application
    version: v.number(),
    expirationDate: v.optional(v.number()), // Unix timestamp handled in application
    language: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    contractType: v.string(),
  })
    .index("compensationStructure_unique", ["compensationStructureId"], { unique: true })
    .index("userFeedback_unique", ["userFeedbackId"], { unique: true })
    .index("financialTerms_unique", ["financialTermsId"], { unique: true }),

  // Risks Collection
  risks: defineTable({
    risk: v.string(),
    explanation: v.string(),
    severity: v.string(), // Validate values ("low", "medium", "high") in application
    contractId: v.id("contractAnalyses"),
  }),

  // Opportunities Collection
  opportunities: defineTable({
    opportunity: v.string(),
    explanation: v.string(),
    impact: v.string(), // Validate values ("low", "medium", "high") in application
    contractId: v.id("contractAnalyses"),
  }),

  // CompensationStructures Collection
  compensationStructures: defineTable({
    baseSalary: v.string(),
    bonuses: v.string(),
    equity: v.string(),
    otherBenefits: v.string(),
    contractId: v.id("contractAnalyses"),
  }).index("contractId_unique", ["contractId"], { unique: true }),

  // UserFeedbacks Collection
  userFeedbacks: defineTable({
    rating: v.number(),
    comments: v.string(),
    contractId: v.id("contractAnalyses"),
  }).index("contractId_unique", ["contractId"], { unique: true }),

  // FinancialTerms Collection
  financialTerms: defineTable({
    description: v.string(),
    details: v.any(),
    contractId: v.id("contractAnalyses"),
  }).index("contractId_unique", ["contractId"], { unique: true }),

  // Files Collection
  /*files: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    contentType: v.string(),
    storageId: v.string(),
    createdAt: v.number(), // Unix timestamp handled in application
  }),*/

  files: defineTable({
    contentType: v.string(),
    createdAt: v.float64(),
    fileName: v.string(),
    storageId: v.string(),
    userId: v.id("users"),    
    fileId: v.string(),
    fileUrl: v.string(),
  }),

  // Embeddings Collection
  embeddings: defineTable({
    userId: v.id("users"),
    embedding: v.array(v.number()), // Representing float64 as number
    text: v.string(),
    fileId: v.id("files"),
  }).index("by_user", ["userId"]),
});
