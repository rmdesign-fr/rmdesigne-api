const reviewService = require('../services/review.service');
const catchAsync = require('../utils/catchAsync');

exports.getApprovedReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getApprovedReviews();
  res.json(reviews);
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getAllReviews();
  res.json(reviews);
});

exports.createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.body);
  res.status(201).json(review);
});

exports.toggleApproval = catchAsync(async (req, res) => {
  const review = await reviewService.toggleApproval(req.params.id, req.body.approved);
  res.json(review);
});

exports.deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  res.json({ message: 'Avis supprimé' });
});
