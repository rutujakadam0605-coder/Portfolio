import express from "express";
import multer from "multer";
import fs from "fs";
import Media from "../models/mediaModel.js";
import supabase from "../config/supabase.js";

const router = express.Router();

/* --------------------------------
   Temp Upload Folder
-------------------------------- */

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/* --------------------------------
   Multer
-------------------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname
        .replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
});

const parseTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags;
  }

  return tags
    .split(",")
    .map((t) => t.trim());
};

/* --------------------------------
   Upload Media
-------------------------------- */

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        title,
        tags,
        type,
        isVideo,
      } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "File required",
          });
      }

      const file =
        req.file;

      /* Folder map */

      const folderMap = {
        graphic:
          "graphic",

        video:
          "video",

        uidesign:
          "uidesign",

        logos:
          "logos",

        presentation:
          "presentation",
      };

      const folder =
        folderMap[
          type?.toLowerCase()
        ] || "graphic";

      /* Safe extension */

      const extension =
        file.originalname
          .split(".")
          .pop()
          ?.toLowerCase();

      /* Safe filename */

      const fileName =
        `${Date.now()}.${extension}`;

      /* Final path */

      const uploadPath =
        `${folder}/${fileName}`;

      console.log(
        "UPLOAD PATH:",
        uploadPath
      );

      /* Read file */

      const fileBuffer =
        fs.readFileSync(
          file.path
        );

      /* Upload */

      const {
        data,
        error,
      } =
        await supabase.storage
          .from(
            "media"
          )
          .upload(
            uploadPath,
            fileBuffer,
            {
              contentType:
                file.mimetype,

              upsert:
                true,
            }
          );

      if (error) {
        console.log(
          "SUPABASE ERROR:",
          error
        );

        throw error;
      }

      /* Public URL */

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(
            "media"
          )
          .getPublicUrl(
            data.path
          );

      /* Save in Mongo */

      const mediaDoc =
  await Media.create({
    title,
    type,
    tags: parseTags(tags),
    url: publicUrlData.publicUrl,
    isVideo:
      isVideo === "true" ||
      isVideo === true,
  });

      /* Delete temp */

      if (
        fs.existsSync(
          file.path
        )
      ) {
        fs.unlinkSync(
          file.path
        );
      }

      return res
        .status(201)
        .json(
          mediaDoc
        );

    } catch (err) {

      console.log(
        "========== ERROR =========="
      );

      console.log(
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Upload failed",

          error:
            err?.message ||
            "Unknown error",
        });
    }
  }
);

/* --------------------------------
   Upload External URL
-------------------------------- */

router.post(
  "/upload-url",
  async (req, res) => {
    try {

      const {
        title,
        url,
        tags,
        type,
        isVideo,
        orientation
      } = req.body;

      const mediaDoc =
  await Media.create({
    title,
    url,
    type,
    tags: parseTags(tags),
    isVideo:
      isVideo === "true" ||
      isVideo === true,
     orientation,
  });

      return res
        .status(201)
        .json(
          mediaDoc
        );

    } catch (err) {

      return res
        .status(500)
        .json({
          message:
            "Adding external media failed",

          error:
            err.message,
        });
    }
  }
);

/* --------------------------------
   Get Media
-------------------------------- */

router.get(
  "/",
  async (
    req,
    res
  ) => {
    try {

      const media =
        await Media.find()
          .sort({
            createdAt:
              -1,
          });

      res.json(
        media
      );

    } catch {

      res
        .status(500)
        .json({
          message:
            "Failed to fetch media",
        });
    }
  }
);

/* --------------------------------
   Delete Media
-------------------------------- */

router.delete(
  "/:id",
  async (
    req,
    res
  ) => {
    try {

      const deleted =
        await Media.findByIdAndDelete(
          req.params.id
        );

      if (
        !deleted
      ) {
        return res
          .status(
            404
          )
          .json({
            message:
              "Media not found",
          });
      }

      return res
        .json({
          message:
            "Deleted successfully",
        });

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Delete failed",
        });
    }
  }
);

export default router;
