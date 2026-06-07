const cloudinary = require("../config/cloudinary");

async function uploadImage(
  fileBuffer,
  folder = "rmdesign/products",
  mimetype = "image/jpeg",
) {
  const b64 = fileBuffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}

async function deleteImage(url) {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
    const parts = url.split("/upload/");
    if (parts.length < 2) return;
    const afterUpload = parts[1];
    // Remove version prefix (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = withoutVersion.replace(/\.\w+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Log but don't throw — image deletion failure shouldn't break the flow
  }
}

async function uploadMultiple(fileBuffers, folder = "rmdesign/products") {
  return Promise.all(fileBuffers.map((buf) => uploadImage(buf, folder)));
}

module.exports = { uploadImage, deleteImage, uploadMultiple };
