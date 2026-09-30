import { getDb, saveDb } from "../db/store.js";
let nextTxnNumber = 10002;
let nextOrderSeq = 84920;
export async function createOrder(req, res) {
  try {
    const userId = req.user?.id || "guest";
    const {
      shippingAddress,
      paymentMethod = "DEMO_UPI",
      items,
      couponCode
    } = req.body;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: "Complete delivery address is required." });
    }
    const db = getDb();
    let orderItems = items;
    if (!orderItems || orderItems.length === 0) {
      const userCart = db.carts[userId] || [];
      if (userCart.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty. Please add items to checkout." });
      }
      orderItems = userCart.map((ci) => {
        const p = db.products.find((prod) => prod._id === ci.productId);
        if (!p) return null;
        return {
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: ci.quantity,
          image: p.images && p.images[0] || "/images/products/placeholder.svg",
          sku: p.sku,
          variant: ci.variant
        };
      }).filter(Boolean);
    }
    let subtotal = 0;
    for (const item of orderItems) {
      const product = db.products.find((p) => p._id === item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.name} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Only ${product.stock} available.`
        });
      }
      subtotal += item.price * item.quantity;
    }
    let discount = 0;
    if (couponCode) {
      const coupon = db.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
      if (coupon && subtotal >= coupon.minOrder) {
        if (coupon.discountPercent) {
          discount = Math.round(subtotal * coupon.discountPercent / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else if (coupon.discountFlat) {
          discount = coupon.discountFlat;
        }
      }
    }
    const deliveryCharge = subtotal - discount >= 499 ? 0 : 49;
    const total = subtotal - discount + deliveryCharge;
    for (const item of orderItems) {
      const product = db.products.find((p) => p._id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }
    const demoTxnId = `DEMO-TXN-${nextTxnNumber++}`;
    const orderId = `NIV-ORD-${nextOrderSeq++}`;
    const trackingNumber = `NV${Math.floor(1e6 + Math.random() * 9e6)}`;
    const deliveryDateObj = /* @__PURE__ */ new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 3);
    const estimatedDelivery = deliveryDateObj.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const newOrder = {
      _id: `ord-${Date.now()}`,
      orderId,
      userId,
      customerName: shippingAddress.fullName,
      customerEmail: req.user?.email || "customer@nivoramarket.com",
      customerPhone: shippingAddress.phone || req.user?.name || "",
      items: orderItems,
      shippingAddress,
      payment: {
        method: paymentMethod,
        transactionId: demoTxnId,
        status: "COMPLETED",
        paidAt: nowIso,
        details: `Simulated transaction approved via ${paymentMethod}`
      },
      pricing: {
        subtotal,
        discount,
        deliveryCharge,
        total
      },
      status: "PLACED",
      timeline: [
        {
          status: "Order Placed",
          timestamp: nowIso,
          note: `Order ${orderId} successfully authorized with dummy transaction ${demoTxnId}.`
        },
        {
          status: "Confirmed",
          timestamp: new Date(Date.now() + 1e3).toISOString(),
          note: "Seller confirmed order and reserved shipment warehouse capacity."
        }
      ],
      trackingNumber,
      estimatedDelivery,
      createdAt: nowIso
    };
    db.orders.unshift(newOrder);
    db.carts[userId] = [];
    db.notifications.unshift({
      _id: `notif-${Date.now()}`,
      userId,
      title: "Order Confirmed!",
      message: `Your order #${orderId} for \u20B9${total.toLocaleString("en-IN")} has been placed successfully.`,
      type: "order",
      isRead: false,
      link: `/orders/${newOrder._id}/tracking`,
      createdAt: nowIso
    });
    saveDb();
    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getUserOrders(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Please log in to view orders" });
    }
    const db = getDb();
    const userOrders = db.orders.filter((o) => o.userId === userId);
    res.json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const order = db.orders.find((o) => o._id === id || o.orderId === id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (req.user?.role !== "admin" && order.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this order." });
    }
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getOrderTracking(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const order = db.orders.find((o) => o._id === id || o.orderId === id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order tracking details not found." });
    }
    const stages = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentStageIndex = stages.indexOf(order.status);
    res.json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      currentStageIndex,
      stages,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      timeline: order.timeline,
      items: order.items,
      shippingAddress: order.shippingAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = getDb();
    const order = db.orders.find((o) => o._id === id || o.orderId === id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (req.user?.role !== "admin" && order.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this order." });
    }
    if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status.toLowerCase().replace(/_/g, " ")}.`
      });
    }
    order.status = "CANCELLED";
    order.timeline.push({
      status: "Cancelled",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      note: reason ? `Cancelled by customer: ${reason}` : "Cancelled by customer"
    });
    for (const item of order.items) {
      const prod = db.products.find((p) => p._id === item.productId);
      if (prod) prod.stock += item.quantity;
    }
    db.notifications.unshift({
      _id: `notif-${Date.now()}`,
      userId: order.userId,
      title: "Order Cancelled",
      message: `Your order #${order.orderId} has been cancelled. Any simulated payment will be refunded within 1 business day.`,
      type: "order",
      isRead: false,
      link: `/orders/${order._id}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    saveDb();
    res.json({
      success: true,
      message: "Order cancelled successfully.",
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
