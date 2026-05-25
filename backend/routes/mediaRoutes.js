import express from "express";
import multer from "multer";
import fs from "fs";
import Media from "../models/mediaModel.js";
import supabase from "../config/supabase.js";

const router = express.Router();

/* -----------------------------
   Temp uploads folder
----------------------------- */

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* -----------------------------
   Multer config
----------------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* -----------------------------
   Upload file to Supabase
----------------------------- */

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, tags, type, isVideo } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: "File required"
        });
      }

      const file = req.file;

      const fileName =
        Date.now() +
        "-" +
        file.originalname.replace(/\s+/g, "-");

      /* Upload to Supabase */

      const { data, error } =
        await supabase.storage
          .from("media")
          .upload(
            `${type}/${fileName}`,
            fs.readFileSync(file.path),
            {
              contentType: file.mimetype,
              upsert: false
            }
          );

      if (error) {
        throw error;
      }

      /* Get public URL */

      const { data: publicUrlData } =
        supabase.storage
          .from("media")
          .getPublicUrl(data.path);

      /* Save DB */

      const mediaDoc =
        await Media.create({
          title,
          type,
          tags: tags
            ? tags.split(",").map(
                t => t.trim()
              )
            : [],
          url: publicUrlData.publicUrl,
          isVideo:
            isVideo === "true" ||
            isVideo === true
        });

      /* Delete temp file */

      fs.unlinkSync(file.path);

      res.status(201).json(mediaDoc);

    } catch (err) {

      console.error(
        "========== UPLOAD ERROR =========="
      );

      console.error(err);

      res.status(500).json({
        message: "Upload failed",
        error: err.message
      });
    }
  }
);

/* -----------------------------
   External URL upload
----------------------------- */

router.post(
  "/upload-url",
  async (req, res) => {
    try {

      const {
        title,
        url,
        tags,
        type,
        isVideo
      } = req.body;

      const mediaDoc =
        await Media.create({
          title,
          url,
          type,
          tags: tags
            ? tags.split(",").map(
                t => t.trim()
              )
            : [],
          isVideo:
            isVideo === "true" ||
            isVideo === true
        });

      res.status(201).json(mediaDoc);

    } catch (err) {

      res.status(500).json({
        message:
          "Adding external media failed",
        error: err.message
      });
    }
  }
);

/* -----------------------------
   Get all media
----------------------------- */

router.get("/", async (req, res) => {
  try {

    const media =
      await Media.find()
        .sort({ createdAt: -1 });

    res.json(media);

  } catch (err) {

    res.status(500).json({
      message:
        "Failed to fetch media"
    });
  }
});

/* -----------------------------
   Delete media
----------------------------- */

router.delete("/:id", async (req, res) => {
  try {

    const deleted =
      await Media.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Media not found"
      });
    }

    res.json({
      message:
        "Deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: "Delete failed"
    });
  }
});

export default router;
