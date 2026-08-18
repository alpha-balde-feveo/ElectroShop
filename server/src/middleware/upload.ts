import multer from "multer";

// Les fichiers sont gardés en mémoire (buffer) puis envoyés à Cloudinary
// dans la route — aucune écriture sur le disque local du serveur, donc
// aucune perte d'image lors d'un redéploiement (disque éphémère sur Render).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  }
});
