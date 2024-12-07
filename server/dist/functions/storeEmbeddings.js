// convex/functions/storeEmbeddings.ts
import { mutation } from '../_generated/server';
import { v } from 'convex/values';
export default mutation({
    args: {
        embeddings: v.array(v.object({
            embedding: v.array(v.float64()),
            text: v.string(),
            fileId: v.id('files'),
        })),
    },
    handler: async ({ db, auth }, { embeddings }) => {
        // Authenticate the user
        const identity = await auth.getUserIdentity();
        if (!identity) {
            throw new Error('Unauthorized');
        }
        const userId = identity.tokenIdentifier;
        // Insert each embedding into the 'embeddings' table
        for (const embeddingData of embeddings) {
            await db.insert('embeddings', {
                userId,
                embedding: embeddingData.embedding,
                text: embeddingData.text,
                fileId: embeddingData.fileId,
            });
        }
    },
});
