import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const brochureDir = "brochure";

// ensure folder exists
if (!fs.existsSync(brochureDir)) {
  fs.mkdirSync(brochureDir);
}

// multer config (always replace old brochure)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, brochureDir),
  filename: (req, file, cb) => cb(null, "brochure.pdf"), // 🔥 SAME NAME ALWAYS
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  },
});

// Upload / replace brochure
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "Brochure uploaded successfully",
  });
});

// Download brochure
router.get("/download", (req, res) => {
  const filePath = path.resolve("brochure/brochure.pdf");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Brochure not found" });
  }

  res.download(filePath, "Resume.pdf");
});

export default router;
