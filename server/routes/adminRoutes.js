import { Router } from "express";
import {
  getDashboard,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  createCategory,
  deleteCategory,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminInventory,
  updateStock,
  getAdminReports,
  uploadImage
} from "../controllers/adminController.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";
import { handleFileUpload } from "../services/uploadService.js";
import { adminLogin } from "../controllers/authController.js";
const router = Router();
router.post("/auth/login", adminLogin);
router.use(verifyToken, requireAdmin);
router.get("/dashboard", getDashboard);
router.get("/products", getAdminProducts);
router.post("/products", handleFileUpload, createProduct);
router.put("/products/:id", handleFileUpload, updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);
router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/customers", getAdminCustomers);
router.get("/inventory", getAdminInventory);
router.put("/inventory/:id/stock", updateStock);
router.get("/reports", getAdminReports);
router.post("/upload", handleFileUpload, uploadImage);
export default router;
