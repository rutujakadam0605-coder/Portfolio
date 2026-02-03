import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import brochureRoutes from "./routes/brochureRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* ====================== CORS (FIXED) ====================== */
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server, Postman, Render health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ====================== MIDDLEWARE ====================== */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ====================== STATIC FILES ====================== */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* Disable ETag to prevent 304 cache issues */
app.set("etag", false);

/* ====================== ROUTES ====================== */
app.use("/api/media", mediaRoutes);
app.use("/api/brochure", brochureRoutes);

app.get("/", (req, res) => {
  res.send("Media API running");
});

/* ====================== START SERVER ====================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
