const express = require("express");
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

// ─── CORS ─────────────────────────────────────────────
// Custom middleware — sets headers directly on res, so they are
// guaranteed to be present on every response including error ones.
const allowedOrigins = (env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

logger.info({ allowedOrigins }, "CORS: allowed origins");

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Reflect every origin back — credentials require an explicit origin, not *
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie",
    );
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ─── Security & parsing ──────────────────────────────
// crossOriginResourcePolicy: false lets cross-origin pages read
// the API responses (CORP is separate from CORS).
app.use(helmet({ crossOriginResourcePolicy: false }));
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
