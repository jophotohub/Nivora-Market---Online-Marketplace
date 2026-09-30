import { Router } from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon
} from "../controllers/cartController.js";
import { optionalAuth } from "../middleware/auth.js";
const router = Router();
router.use(optionalAuth);
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateQuantity);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);
router.post("/coupon", applyCoupon);
export default router;
