// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
export default defineSchema({
    files: defineTable({
        userId: 'string',
        fileName: 'string',
        contentType: 'string',
        storageId: 'id',
    }),
    embeddings: defineTable({
        userId: 'string',
        embedding: ['float64'],
        text: 'string',
        fileId: 'id:files',
    }).index('by_user', ['userId']),
});
