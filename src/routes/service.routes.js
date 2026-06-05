const express = require('express')
const router = express.Router()
const serviceController = require('../controllers/service.controller')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

// Public routes
router.get('/:slug/gallery', serviceController.getServiceGallery)

// Protected admin routes
router.post(
  '/:slug/gallery',
  protect,
  upload.single('image'),
  serviceController.addGalleryImage
)

router.put(
  '/gallery/:id',
  protect,
  serviceController.updateGalleryImage
)

router.delete(
  '/gallery/:id',
  protect,
  serviceController.deleteGalleryImage
)

module.exports = router
