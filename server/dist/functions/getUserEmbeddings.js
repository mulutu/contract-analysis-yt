// convex/functions/getUserEmbeddings.ts
import { query } from '../_generated/server';
export default query(async ({ db, auth }) => {
    // Authenticate the user
    const identity = await auth.getUserIdentity();
    if (!identity) {
        throw new Error('Unauthorized');
    }
    const userId = identity.tokenIdentifier;
    // Retrieve embeddings associated with the user
    const embeddings = await db
        .query('embeddings')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
    return embeddings;
});
