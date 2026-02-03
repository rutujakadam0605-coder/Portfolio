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

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use("/api/brochure", brochureRoutes);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.set("etag", false); // 🔥 IMPORTANT

// Routes
app.use("/api/media", mediaRoutes);

app.get("/", (req, res) => res.send("Media API running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
