import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderTracking,
  cancelOrder
} from "../controllers/orderController.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
const router = Router();
router.post("/", optionalAuth, createOrder);
router.get("/my-orders", verifyToken, getUserOrders);
router.get("/:id", optionalAuth, getOrderById);
router.get("/:id/tracking", optionalAuth, getOrderTracking);
router.post("/:id/cancel", verifyToken, cancelOrder);
export default router;
