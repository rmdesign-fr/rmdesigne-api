const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const serviceService = require('../services/service.service')

exports.getServiceGallery = catchAsync(async (req, res) => {
  const { slug } = req.params
  const gallery = await serviceService.getGalleryBySlug(slug)
  
  res.json(gallery)
})

exports.addGalleryImage = catchAsync(async (req, res) => {
  const { slug } = req.params
  const { title, order } = req.body

  if (!req.file) {
    throw new AppError('Image file is required', 400)
  }

  const galleryItem = await serviceService.addGalleryImage({
    serviceSlug: slug,
    imageFile: req.file,
    title,
    order: order ? parseInt(order) : undefined,
  })

  res.status(201).json(galleryItem)
})

exports.updateGalleryImage = catchAsync(async (req, res) => {
  const { id } = req.params
  const { title, order } = req.body

  const updated = await serviceService.updateGalleryImage(id, {
    title,
    order: order ? parseInt(order) : undefined,
  })

  res.json(updated)
})

exports.deleteGalleryImage = catchAsync(async (req, res) => {
  const { id } = req.params
  await serviceService.deleteGalleryImage(id)

  res.status(204).send()
})
