const multer = require("multer");
const AppError = require("../utils/AppError");

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  // Accept any image type — Cloudinary handles conversion.
  // Reject non-image files (documents, videos, executables, etc.)
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Seuls les fichiers image sont acceptés", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB — covers high-res pro photos
    files: 5,
  },
});

module.exports = upload;
