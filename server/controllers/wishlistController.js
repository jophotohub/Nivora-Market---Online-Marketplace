import { getDb, saveDb } from "../db/store.js";
export async function getWishlist(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const db = getDb();
    const productIds = db.wishlists[userId] || [];
    const products = productIds.map((id) => db.products.find((p) => p._id === id)).filter(Boolean);
    res.json({
      success: true,
      products,
      productIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function toggleWishlist(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }
    const db = getDb();
    if (!db.wishlists[userId]) {
      db.wishlists[userId] = [];
    }
    const index = db.wishlists[userId].indexOf(productId);
    let isAdded = false;
    if (index > -1) {
      db.wishlists[userId].splice(index, 1);
      isAdded = false;
    } else {
      db.wishlists[userId].push(productId);
      isAdded = true;
    }
    saveDb();
    res.json({
      success: true,
      isAdded,
      message: isAdded ? "Added to wishlist" : "Removed from wishlist",
      count: db.wishlists[userId].length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function moveToCart(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const { productId } = req.body;
    const db = getDb();
    if (!db.wishlists[userId]) db.wishlists[userId] = [];
    if (!db.carts[userId]) db.carts[userId] = [];
    db.wishlists[userId] = db.wishlists[userId].filter((id) => id !== productId);
    const existing = db.carts[userId].find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      db.carts[userId].push({ productId, quantity: 1 });
    }
    saveDb();
    res.json({
      success: true,
      message: "Product moved to cart!"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
