const { Router } = require('express');
const { z } = require('zod');
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().max(2000).trim().optional().or(z.literal('')),
  price: z.string().transform(Number).pipe(z.number().positive()),
  category: z.enum(['vetements', 'accessoires', 'stickers', 'lifestyle']),
  stock: z.string().transform(Number).pipe(z.number().int().min(0)),
  isActive: z.string().transform((v) => v === 'true').pipe(z.boolean()),
});

const updateProductSchema = createProductSchema.partial().extend({
  existingImages: z.union([z.string(), z.array(z.string())]).optional(),
});

router.get('/', productController.getProducts);
router.get('/admin', auth, productController.getProductsAdmin);
router.get('/:id', productController.getProductById);
router.post('/', auth, upload.array('images', 5), validate(createProductSchema), productController.createProduct);
router.put('/:id', auth, upload.array('images', 5), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
