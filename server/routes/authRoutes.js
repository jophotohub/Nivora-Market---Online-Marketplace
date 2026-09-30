import { Router } from "express";
import {
  register,
  login,
  adminLogin,
  adminRegister,
  getMe,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
  forgotPassword
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/admin/login", adminLogin);
router.post("/admin-register", adminRegister);
router.post("/admin/register", adminRegister);
router.post("/forgot-password", forgotPassword);
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);
router.get("/addresses", verifyToken, getAddresses);
router.post("/addresses", verifyToken, addAddress);
router.delete("/addresses/:addressId", verifyToken, deleteAddress);
export default router;
