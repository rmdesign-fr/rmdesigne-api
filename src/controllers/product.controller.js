const catchAsync = require('../utils/catchAsync');
const productService = require('../services/product.service');

exports.getProducts = catchAsync(async (req, res) => {
  const products = await productService.getProducts(req.query.category);
  res.json(products);
});

exports.getProductsAdmin = catchAsync(async (_req, res) => {
  const products = await productService.getProductsAdmin();
  res.json(products);
});

exports.getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json(product);
});

exports.createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files || []);
  res.status(201).json(product);
});

exports.updateProduct = catchAsync(async (req, res) => {
  // existingImages: normalize to array (FormData sends string or string[])
  const existing = req.body.existingImages;
  const existingImageUrls = Array.isArray(existing)
    ? existing
    : existing
      ? [existing]
      : [];

  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.files || [],
    existingImageUrls
  );
  res.json(product);
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json(result);
});
