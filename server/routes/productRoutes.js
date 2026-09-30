import { Router } from "express";
import {
  getProducts,
  getProductById,
  getSearchSuggestions,
  addReview
} from "../controllers/productController.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/adminController.js";
import { optionalAuth, verifyToken, requireAdmin } from "../middleware/auth.js";
import { handleFileUpload } from "../services/uploadService.js";
const router = Router();
router.get("/", getProducts);
router.get("/search-suggestions", getSearchSuggestions);
router.get("/:id", getProductById);
router.post("/:id/reviews", optionalAuth, addReview);
router.post("/", verifyToken, requireAdmin, handleFileUpload, createProduct);
router.put("/:id", verifyToken, requireAdmin, handleFileUpload, updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);
export default router;
