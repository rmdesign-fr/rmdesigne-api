const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const cloudinaryService = require("./cloudinary.service");
const { CATEGORY_MAP, CATEGORY_MAP_REVERSE } = require("../utils/constants");

function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: Number(product.price),
    category: CATEGORY_MAP_REVERSE[product.category],
    stock: product.stock,
    isActive: product.isActive,
    surCommande: product.surCommande || false,
    displayOnly: product.displayOnly || false,
    images: product.images,
    createdAt: product.createdAt.toISOString(),
  };
}

async function getProducts(category) {
  const where = { isActive: true };
  if (category && CATEGORY_MAP[category]) {
    where.category = CATEGORY_MAP[category];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return products.map(serializeProduct);
}

async function getProductsAdmin() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError("Produit introuvable", 404);
  }
  return serializeProduct(product);
}

async function createProduct(data, files) {
  const imageUrls = files.length
    ? await cloudinaryService.uploadMultiple(files.map((f) => f.buffer))
    : [];

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description || null,
      price: parseFloat(data.price),
      category: CATEGORY_MAP[data.category],
      stock: parseInt(data.stock) || 0,
      isActive: data.isActive === "true" || data.isActive === true,
      surCommande: data.surCommande === "true" || data.surCommande === true,
      displayOnly: data.displayOnly === "true" || data.displayOnly === true,
      images: imageUrls,
    },
  });

  return serializeProduct(product);
}

async function updateProduct(id, data, newFiles, existingImageUrls) {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) {
    throw new AppError("Produit introuvable", 404);
  }

  // Delete removed images from Cloudinary
  const removed = current.images.filter(
    (img) => !existingImageUrls.includes(img),
  );
  await Promise.all(removed.map((img) => cloudinaryService.deleteImage(img)));

  // Upload new images
  const newImageUrls = newFiles.length
    ? await cloudinaryService.uploadMultiple(newFiles.map((f) => f.buffer))
    : [];

  const allImages = [...existingImageUrls, ...newImageUrls];

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.category !== undefined)
    updateData.category = CATEGORY_MAP[data.category];
  if (data.stock !== undefined) updateData.stock = parseInt(data.stock) || 0;
  if (data.isActive !== undefined)
    updateData.isActive = data.isActive === "true" || data.isActive === true;
  if (data.surCommande !== undefined)
    updateData.surCommande =
      data.surCommande === "true" || data.surCommande === true;
  if (data.displayOnly !== undefined)
    updateData.displayOnly =
      data.displayOnly === "true" || data.displayOnly === true;
  updateData.images = allImages;

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return serializeProduct(product);
}

async function deleteProduct(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError("Produit introuvable", 404);
  }

  // Delete all images from Cloudinary
  await Promise.all(
    product.images.map((img) => cloudinaryService.deleteImage(img)),
  );

  await prisma.product.delete({ where: { id } });
  return { message: "Supprimé" };
}

module.exports = {
  getProducts,
  getProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
