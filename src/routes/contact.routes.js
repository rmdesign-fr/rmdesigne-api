const { Router } = require('express');
const { z } = require('zod');
const contactController = require('../controllers/contact.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  phone: z.string().max(30).trim().optional().or(z.literal('')),
  email: z.string().email().trim(),
  message: z.string().min(5).max(3000).trim(),
});

router.post('/', contactLimiter, validate(contactSchema), contactController.createContactMessage);
router.get('/', auth, contactController.getAllMessages);
router.delete('/:id', auth, contactController.deleteMessage);

module.exports = router;
