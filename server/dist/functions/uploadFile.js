// convex/functions/uploadFile.ts
import { mutation } from '../_generated/server';
import { v } from 'convex/values';
export default mutation({
    args: {
        fileBuffer: v.bytes(), // Binary data
        fileName: v.string(),
        contentType: v.string(),
    },
    handler: async ({ db, auth, storage }, { fileBuffer, fileName, contentType }) => {
        // Authenticate the user
        const identity = await auth.getUserIdentity();
        if (!identity) {
            throw new Error('Unauthorized');
        }
        const userId = identity.tokenIdentifier;
        // Convert fileBuffer to a Buffer if Blob is not supported
        const buffer = Buffer.from(fileBuffer);
        // Store the file in Convex storage using the correct method (e.g., 'put')
        const storageId = await storage.put(buffer); // Adjusted method
        // Insert file metadata into the 'files' table
        const fileId = await db.insert('files', {
            userId,
            fileName,
            contentType,
            storageId,
        });
        // Retrieve the URL of the stored file
        const url = await storage.getUrl(storageId);
        // Ensure the URL is valid
        if (!url) {
            throw new Error('Failed to retrieve file URL');
        }
        return { fileId, url };
    },
});
