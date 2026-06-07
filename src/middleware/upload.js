const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // No MIME-type filter — Cloudinary validates content server-side.
  // Some browsers (Chrome on Windows) send HEIC/HEIF files as
  // application/octet-stream, so a strict filter would block them.
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB — covers high-res pro photos
    files: 5,
  },
});

module.exports = upload;
