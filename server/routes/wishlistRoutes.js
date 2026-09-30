import { Router } from "express";
import {
  getWishlist,
  toggleWishlist,
  moveToCart
} from "../controllers/wishlistController.js";
import { optionalAuth } from "../middleware/auth.js";
const router = Router();
router.use(optionalAuth);
router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.post("/move-to-cart", moveToCart);
export default router;
