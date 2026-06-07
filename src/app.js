const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const { globalLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/auth.routes");
const bookingRoutes = require("./routes/booking.routes");
const productRoutes = require("./routes/product.routes");
const reviewRoutes = require("./routes/review.routes");
const orderRoutes = require("./routes/order.routes");
const contactRoutes = require("./routes/contact.routes");
const paypalRoutes = require("./routes/paypal.routes");
const serviceRoutes = require("./routes/service.routes");

const app = express();

// Railway / Heroku / etc. terminate TLS at a proxy and forward via X-Forwarded-For.
// Trust the first proxy hop so req.ip and express-rate-limit work correctly.
app.set("trust proxy", 1);

// ─── Security & parsing ──────────────────────────────────
app.use(helmet());
// Support a single origin or a comma-separated list (e.g. for custom domain + Railway URL)
const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((o) => o.trim().replace(/\/+$/, "")) // trim and strip trailing slashes
  .filter(Boolean);

logger.info({ allowedOrigins }, "CORS allowed origins");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / same-origin requests (no Origin header)
      if (!origin) return callback(null, true);
      const normalised = origin.trim().replace(/\/+$/, "");
      if (allowedOrigins.includes(normalised)) {
        callback(null, true);
      } else {
        // Don't throw — just return false so the browser blocks it,
        // but Express doesn't turn it into a 500.
        logger.warn({ origin, allowedOrigins }, "CORS blocked request");
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(globalLimiter);

// ─── Request logging ─────────────────────────────────────
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, "incoming request");
  next();
});

// ─── Health check ────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/services", serviceRoutes);

// ─── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} introuvable` });
});

// ─── Error handler ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
