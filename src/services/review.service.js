const prisma = require('../config/db');
const AppError = require('../utils/AppError');

async function getApprovedReviews() {
  return prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getAllReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function createReview(data) {
  return prisma.review.create({
    data: {
      name: data.name,
      service: data.service,
      text: data.text,
      rating: data.rating,
      approved: data.approved ?? false,
    },
  });
}

async function toggleApproval(id, approved) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError('Avis introuvable', 404);

  return prisma.review.update({
    where: { id },
    data: { approved },
  });
}

async function deleteReview(id) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError('Avis introuvable', 404);

  await prisma.review.delete({ where: { id } });
}

module.exports = {
  getApprovedReviews,
  getAllReviews,
  createReview,
  toggleApproval,
  deleteReview,
};
