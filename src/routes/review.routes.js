const { Router } = require('express');
const { z } = require('zod');
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

const createReviewSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  service: z.string().min(2).max(200).trim(),
  text: z.string().min(5).max(1000).trim(),
  rating: z.number().int().min(1).max(5),
  approved: z.boolean().optional(),
});

const toggleApprovalSchema = z.object({
  approved: z.boolean(),
});

router.get('/', reviewController.getApprovedReviews);
router.get('/all', auth, reviewController.getAllReviews);
router.post('/', upload.array('images', 5), reviewController.createReview);
router.put('/:id', auth, upload.array('images', 5), reviewController.updateReview);
router.put('/:id/approve', auth, validate(toggleApprovalSchema), reviewController.toggleApproval);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
