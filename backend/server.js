import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import brochureRoutes from "./routes/brochureRoutes.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ====================== FIX __dirname ====================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ====================== CORS ====================== */
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
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

app.set("etag", false);

/* ====================== API ROUTES ====================== */
app.use("/api/media", mediaRoutes);
app.use("/api/brochure", brochureRoutes);

/* ====================== REACT BUILD ====================== */

// Adjust path if your frontend build folder differs
app.use(express.static(path.join(__dirname, "client/dist")));

/* Catch all frontend routes */
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "client/dist/index.html")
  );
});

/* ====================== FRONTEND ROUTES ====================== */

// Change "nexvel" if your frontend folder has a different name
app.use(express.static(path.join(__dirname, "../nexvel/dist")));

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../nexvel/dist/index.html")
  );
});

/* ====================== START SERVER ====================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
