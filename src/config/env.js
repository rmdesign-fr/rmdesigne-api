const { z } = require('zod');

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  BUSINESS_EMAIL: z.string().email(),
  BOOKING_SLOT_START: z.coerce.number().int().min(0).max(23).default(8),
  BOOKING_SLOT_END: z.coerce.number().int().min(0).max(23).default(18),
  BOOKING_SLOT_INTERVAL: z.coerce.number().int().min(15).max(240).default(60),
  BOOKING_WORKING_DAYS: z.string().default('1,2,3,4,5'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
