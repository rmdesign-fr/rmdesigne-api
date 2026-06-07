const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const cloudinaryService = require("./cloudinary.service");

async function getApprovedReviews() {
  return prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getAllReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function createReview(data, files) {
  const images = [];

  // Upload images to Cloudinary if provided
  if (files && files.length > 0) {
    for (const file of files) {
      const imageUrl = await cloudinaryService.uploadImage(
        file.buffer,
        "reviews",
        file.mimetype,
      );
      images.push(imageUrl);
    }
  }

  return prisma.review.create({
    data: {
      name: data.name,
      service: data.service,
      text: data.text,
      rating: parseInt(data.rating),
      images,
      approved: data.approved === "true" || data.approved === true,
    },
  });
}

async function updateReview(id, data, files) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Avis introuvable", 404);

  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.service !== undefined) updateData.service = data.service;
  if (data.text !== undefined) updateData.text = data.text;
  if (data.rating !== undefined) updateData.rating = parseInt(data.rating);

  // Handle image updates
  if (files && files.length > 0) {
    const newImages = [];
    for (const file of files) {
      const imageUrl = await cloudinaryService.uploadImage(
        file.buffer,
        "reviews",
        file.mimetype,
      );
      newImages.push(imageUrl);
    }
    // Append new images to existing ones
    updateData.images = [...review.images, ...newImages];
  }

  return prisma.review.update({
    where: { id },
    data: updateData,
  });
}

async function toggleApproval(id, approved) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Avis introuvable", 404);

  return prisma.review.update({
    where: { id },
    data: { approved },
  });
}

async function deleteReview(id) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Avis introuvable", 404);

  // Delete images from Cloudinary
  if (review.images && review.images.length > 0) {
    for (const imageUrl of review.images) {
      try {
        await cloudinaryService.deleteImage(imageUrl);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }
  }

  await prisma.review.delete({ where: { id } });
}

module.exports = {
  getApprovedReviews,
  getAllReviews,
  createReview,
  updateReview,
  toggleApproval,
  deleteReview,
};
