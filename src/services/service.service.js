const { PrismaClient } = require('@prisma/client')
const cloudinaryService = require('./cloudinary.service')
const AppError = require('../utils/AppError')

const prisma = new PrismaClient()

exports.getGalleryBySlug = async (slug) => {
  const gallery = await prisma.serviceGallery.findMany({
    where: { serviceSlug: slug },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  return gallery
}

exports.addGalleryImage = async ({ serviceSlug, imageFile, title, order }) => {
  // Upload image to Cloudinary
  const imageUrl = await cloudinaryService.uploadImage(
    imageFile.buffer,
    `services/${serviceSlug}`
  )

  const galleryItem = await prisma.serviceGallery.create({
    data: {
      serviceSlug,
      imageUrl,
      title,
      order: order || 0,
    },
  })

  return galleryItem
}

exports.updateGalleryImage = async (id, data) => {
  const updated = await prisma.serviceGallery.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.order !== undefined && { order: data.order }),
    },
  })

  return updated
}

exports.deleteGalleryImage = async (id) => {
  const item = await prisma.serviceGallery.findUnique({
    where: { id },
  })

  if (!item) {
    throw new AppError('Gallery item not found', 404)
  }

  // Delete from Cloudinary
  try {
    await cloudinaryService.deleteImage(item.imageUrl)
  } catch (err) {
    console.error('Failed to delete image from Cloudinary:', err)
  }

  await prisma.serviceGallery.delete({
    where: { id },
  })
}
