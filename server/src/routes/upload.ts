import { Router } from "express";
import { upload } from "../middleware/upload";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.post("/", adminAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(201).json({
    url: `/uploads/${req.file.filename}`
  });
});

export default router;
