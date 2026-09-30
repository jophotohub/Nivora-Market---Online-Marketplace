import jwt from "jsonwebtoken";
import { getDb } from "../db/store.js";
export const JWT_SECRET = process.env.JWT_SECRET || "nivora_secret_jwt_key_super_secure_college_project_2026";
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing or invalid format. Please log in."
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.users.find((u) => u._id === decoded.id || u.email === decoded.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found or has been deactivated."
      });
    }
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again."
    });
  }
}
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDb();
      const user = db.users.find((u) => u._id === decoded.id || u.email === decoded.email);
      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        };
      }
    } catch (e) {
    }
  }
  next();
}
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Administrative privileges required for this operation."
    });
  }
  next();
}
