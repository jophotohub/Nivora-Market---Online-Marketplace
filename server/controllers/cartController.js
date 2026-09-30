import { getDb, saveDb } from "../db/store.js";
export async function getCart(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const db = getDb();
    const rawCart = db.carts[userId] || [];
    let subtotal = 0;
    const items = rawCart.map((item) => {
      const product = db.products.find((p) => p._id === item.productId);
      if (!product) return null;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        stock: product.stock,
        category: product.category,
        quantity: item.quantity,
        variant: item.variant,
        itemTotal
      };
    }).filter(Boolean);
    const deliveryCharge = subtotal >= 499 || subtotal === 0 ? 0 : 49;
    const total = subtotal + deliveryCharge;
    res.json({
      success: true,
      items,
      itemCount: items.reduce((acc, i) => acc + (i?.quantity || 0), 0),
      pricing: {
        subtotal,
        discount: 0,
        deliveryCharge,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function addToCart(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const { productId, quantity = 1, variant } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    const db = getDb();
    const product = db.products.find((p) => p._id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: "Sorry, this product is currently out of stock." });
    }
    if (!db.carts[userId]) {
      db.carts[userId] = [];
    }
    const existingIndex = db.carts[userId].findIndex(
      (item) => item.productId === productId && item.variant === variant
    );
    if (existingIndex > -1) {
      const newQty = db.carts[userId][existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} units).`
        });
      }
      db.carts[userId][existingIndex].quantity = newQty;
    } else {
      db.carts[userId].push({
        productId,
        quantity: Math.min(Number(quantity), product.stock),
        variant
      });
    }
    saveDb();
    const totalCount = db.carts[userId].reduce((acc, i) => acc + i.quantity, 0);
    res.json({
      success: true,
      message: `Added ${product.name} to cart.`,
      itemCount: totalCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function updateQuantity(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const { productId, quantity, variant } = req.body;
    const db = getDb();
    if (!db.carts[userId]) return res.json({ success: true, items: [] });
    const itemIndex = db.carts[userId].findIndex(
      (item) => item.productId === productId && (variant === void 0 || item.variant === variant)
    );
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }
    const product = db.products.find((p) => p._id === productId);
    const newQty = Number(quantity);
    if (newQty <= 0) {
      db.carts[userId].splice(itemIndex, 1);
    } else {
      if (product && newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`
        });
      }
      db.carts[userId][itemIndex].quantity = newQty;
    }
    saveDb();
    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function removeFromCart(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const { productId } = req.params;
    const { variant } = req.query;
    const db = getDb();
    if (!db.carts[userId]) return res.json({ success: true, message: "Item removed" });
    db.carts[userId] = db.carts[userId].filter(
      (item) => !(item.productId === productId && (variant === void 0 || item.variant === variant))
    );
    saveDb();
    res.json({ success: true, message: "Item removed from your cart." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function clearCart(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const db = getDb();
    db.carts[userId] = [];
    saveDb();
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function applyCoupon(req, res) {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    const db = getDb();
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code." });
    }
    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of \u20B9${coupon.minOrder}.`
      });
    }
    let discount = 0;
    if (coupon.discountPercent) {
      discount = Math.round(orderSubtotal * coupon.discountPercent / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountFlat) {
      discount = coupon.discountFlat;
    }
    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        discount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
