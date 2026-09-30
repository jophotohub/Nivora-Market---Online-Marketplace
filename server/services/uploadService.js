import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

export function isCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== "demo-cloud" &&
    apiKey !== "123456789012345" &&
    !cloudName.includes("placeholder")
  );
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Accepted formats: JPG, JPEG, PNG, WEBP."));
    }
  }
});

export function handleFileUpload(req, res, next) {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds the 5 MB limit." });
      }
      return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
}

export async function uploadImageBuffer(buffer, originalname = "upload.jpg", mimetype = "image/jpeg") {
  if (isCloudinaryConfigured()) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "nivora_market/products",
            resource_type: "image"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return {
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        provider: "cloudinary"
      };
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local storage:", err.message);
    }
  }

  // Fallback to local storage in public/uploads/
  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalname) || (mimetype === "image/png" ? ".png" : mimetype === "image/webp" ? ".webp" : ".jpg");
  const filename = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  return {
    success: true,
    url: `/uploads/${filename}`,
    publicId: filename,
    provider: "local"
  };
}
