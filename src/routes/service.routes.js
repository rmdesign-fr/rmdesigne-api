const express = require('express')
const router = express.Router()
const serviceController = require('../controllers/service.controller')
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')

// Public routes
router.get('/:slug/gallery', serviceController.getServiceGallery)

// Protected admin routes
router.post(
  '/:slug/gallery',
  auth,
  upload.single('image'),
  serviceController.addGalleryImage
)

router.put(
  '/gallery/:id',
  auth,
  serviceController.updateGalleryImage
)

router.delete(
  '/gallery/:id',
  auth,
  serviceController.deleteGalleryImage
)

module.exports = router
