import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../controllers/notificationController.js";
import { optionalAuth } from "../middleware/auth.js";
const router = Router();
router.use(optionalAuth);
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
export default router;
