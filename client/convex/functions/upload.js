import { mutation, query } from '../_generated/server'
import { v } from 'convex/values';


export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

/*export const generateUploadUrl = mutation(async (ctx) => {
  //return await ctx.storage.generateUploadUrl();
  const storageId = ctx.storage.createId();
  const url = await ctx.storage.getUploadUrl(storageId);
  return { url, storageId };
});*/

/*export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.waitForReady();
    const storageId = ctx.fileStorage.createId();
    const url = await ctx.fileStorage.getUploadUrl(storageId);
    return { url, storageId };
  },
});*/

/*export const generateUploadUrl = mutation(async ({ ctx }) => {
  await ctx.waitForReady(); // Wait for Convex environment to be ready

  const storageId = ctx.fileStorage.createId();
  const url = await ctx.fileStorage.getUploadUrl(storageId);
  return { url, storageId };
});*/

/*export const generateUploadUrl = mutation(async ({ ctx }) => {
  return await ctx.storage.createId().then(async (storageId) => {
    //const url = await ctx.fileStorage.getUploadUrl(storageId);
    const url = await ctx.fileStorage.getUrl(storageId)
    return { url, storageId };
  });
});*/


/**
 * Stores the file metadata in the Convex database after a successful upload.
 * 
 * @param {object} args - The arguments for storing the file.
 * @param {string} args.fileName - The name of the uploaded file.
 * @param {string} args.contentType - The MIME type of the file.
 * @param {string} args.url - The signed URL used to upload the file.
 * @param {string} args.userId - The ID of the user uploading the file.
 */
export const storeFile = mutation({
  args: {
    fileName: v.string(),
    contentType: v.string(),
    userId: v.id("users"),
    storageId: v.string(),
    fileId: v.string(),
    fileUrl: v.string(),
  },
  handler: async (ctx, { fileName, contentType, userId, storageId, fileId, fileUrl }) => {
    // db, fileStorage }, { fileName, contentType, url, userId, storageId }) => {
    // `url` is the upload URL you previously generated and used to PUT the file.
    // Use fileStorage.store to finalize storing it in Convex.
    //const { storageId } = await fileStorage.store(url);
    // Create a database entry linking to this file
    const fileDoc = {
      userId,
      fileName,
      contentType,
      storageId,
      fileId,
      fileUrl,
      createdAt: Date.now(),
    };

    const id = await ctx.db.insert("files", {
      ...fileDoc,
    });
    return { id, storageId };
  }
});


export const getFileUrl = mutation({
  args: {
    storageId: v.string()
  },
  handler: async (ctx, args) => {

    if (!ctx.storage) {
      throw new Error("File Storage is not configured.");
    }

    try {
      const fileUrl = await ctx.storage.getUrl(args.storageId);
      return { fileUrl };
    } catch (error) {
      console.error("Error fetching file URL:", error);
      throw new Error("Failed to retrieve file URL.");
    }
  }
});

// Optional: a query to retrieve the file URL later:
export const getFileUrlxxx = query(async ({ fileStorage }, { storageId }) => {
  // Retrieve a signed URL to access the stored file
  const fileUrl = await fileStorage.getUrl(storageId);
  return { fileUrl };
});
