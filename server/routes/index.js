import { Router } from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import cartRoutes from "./cartRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import orderRoutes from "./orderRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import adminRoutes from "./adminRoutes.js";
import { SEED_PROMOTIONS } from "../seedData.js";
const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    message: "Nivora Market API is running",
    app: "Nivora Market",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});
router.get("/promotions", (req, res) => {
  res.json({
    success: true,
    promotions: SEED_PROMOTIONS
  });
});
export default router;
