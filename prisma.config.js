// prisma.config.js — plain CommonJS, no TypeScript compilation issues
"use strict";

// Load .env file
require("dotenv").config();

const url =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url,
  },
};
