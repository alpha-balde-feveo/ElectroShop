import { Router } from "express";
import { upload } from "../middleware/upload";
import { adminAuth } from "../middleware/adminAuth";
import cloudinary from "../config/cloudinary";

const router = Router();

router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "electroshop", resource_type: "image" },
        (err, uploaded) => {
          if (err || !uploaded) return reject(err ?? new Error("Upload failed"));
          resolve(uploaded);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Échec de l'envoi de l'image" });
  }
});

export default router;
