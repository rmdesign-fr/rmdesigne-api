const { Router } = require("express");
const { z } = require("zod");
const productController = require("../controllers/product.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const router = Router();

// Helper: coerce FormData strings to number, default to 0 for empty/missing
const coerceNum = (v) => (v === "" || v == null ? 0 : parseFloat(String(v)));
const coerceInt = (v) => (v === "" || v == null ? 0 : parseInt(String(v), 10));
const coerceBool = (v) => String(v ?? "false") === "true";

const createProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().max(2000).trim().optional().or(z.literal("")),
  // price & stock are optional for vitrine / sur-commande products
  price: z.preprocess(coerceNum, z.number().min(0)),
  category: z.enum(["vetements", "accessoires", "stickers", "lifestyle"]),
  stock: z.preprocess(coerceInt, z.number().int().min(0)),
  isActive: z.preprocess((v) => coerceBool(v ?? "true"), z.boolean()),
  surCommande: z.preprocess(coerceBool, z.boolean()).optional(),
  displayOnly: z.preprocess(coerceBool, z.boolean()).optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  existingImages: z.union([z.string(), z.array(z.string())]).optional(),
});

router.get("/", productController.getProducts);
router.get("/admin", auth, productController.getProductsAdmin);
router.get("/:id", productController.getProductById);
router.post(
  "/",
  auth,
  upload.array("images", 5),
  validate(createProductSchema),
  productController.createProduct,
);
router.put(
  "/:id",
  auth,
  upload.array("images", 5),
  validate(updateProductSchema),
  productController.updateProduct,
);
router.delete("/:id", auth, productController.deleteProduct);

module.exports = router;
