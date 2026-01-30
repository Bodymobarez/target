import path from "path";
import fs from "fs";
import { Response } from "express";
import multer from "multer";
import type { AuthRequest } from "../middleware/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // ignore
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|gif|webp)$/i;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images (JPEG, PNG, GIF, WebP) are allowed"));
  },
});

export const uploadMiddleware = upload.single("image");

type RequestWithFile = AuthRequest & { file?: Express.Multer.File };

export async function handleUpload(req: RequestWithFile, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Bad request", message: "No image file uploaded" });
    return;
  }
  const url = `/uploads/${file.filename}`;
  res.status(201).json({ url });
}
