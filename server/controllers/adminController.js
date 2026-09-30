import { getDb, saveDb } from "../db/store.js";
import { uploadImageBuffer } from "../services/uploadService.js";
export async function getDashboard(req, res) {
  try {
    const db = getDb();
    const validOrders = db.orders.filter((o) => o.status !== "CANCELLED");
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const totalOrders = db.orders.length;
    const pendingOrders = db.orders.filter((o) => ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"].includes(o.status)).length;
    const totalProducts = db.products.length;
    const lowStockProducts = db.products.filter((p) => p.stock > 0 && p.stock <= 20).length;
    const outOfStockProducts = db.products.filter((p) => p.stock === 0).length;
    const totalCustomers = db.users.filter((u) => u.role === "user").length;
    const recentOrders = db.orders.slice(0, 5).map((o) => ({
      _id: o._id,
      orderId: o.orderId,
      customerName: o.customerName,
      total: o.pricing?.total || 0,
      status: o.status,
      itemCount: o.items.length,
      createdAt: o.createdAt
    }));
    const productSalesMap = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        if (!productSalesMap[item.productId]) {
          const prod = db.products.find((p) => p._id === item.productId);
          productSalesMap[item.productId] = {
            product: prod || { name: item.name, images: [item.image], price: item.price },
            unitsSold: 0,
            revenue: 0
          };
        }
        productSalesMap[item.productId].unitsSold += item.quantity;
        productSalesMap[item.productId].revenue += item.price * item.quantity;
      }
    }
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
    const categorySales = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        const prod = db.products.find((p) => p._id === item.productId);
        const cat = prod?.category || "General";
        categorySales[cat] = (categorySales[cat] || 0) + item.price * item.quantity;
      }
    }
    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCustomers
      },
      recentOrders,
      topProducts,
      categorySales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAdminProducts(req, res) {
  try {
    const db = getDb();
    const { search, category, stockStatus } = req.query;
    let list = [...db.products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (category && category !== "all") {
      list = list.filter((p) => p.categorySlug === category.toLowerCase() || p.category.toLowerCase() === category.toLowerCase());
    }
    if (stockStatus === "low") {
      list = list.filter((p) => p.stock > 0 && p.stock <= 20);
    } else if (stockStatus === "out") {
      list = list.filter((p) => p.stock === 0);
    } else if (stockStatus === "in") {
      list = list.filter((p) => p.stock > 20);
    }
    res.json({
      success: true,
      products: list,
      total: list.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function createProduct(req, res) {
  try {
    const {
      name,
      sku,
      category,
      categorySlug,
      brand,
      price,
      originalPrice,
      stock,
      images,
      shortSpec,
      description,
      specifications,
      variants,
      isFeatured,
      isDeal
    } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "Product name, price, and category are required." });
    }
    const db = getDb();
    const catSearch = (category || "").toLowerCase().trim();
    const catSlugSearch = (categorySlug || catSearch.replace(/\s+/g, "-")).toLowerCase().trim();
    const matchedCategory = db.categories.find(
      (c) => c.slug.toLowerCase() === catSlugSearch || c.name.toLowerCase() === catSearch
    );
    if (!matchedCategory) {
      return res.status(400).json({
        success: false,
        message: `Invalid product category '${category}'. Must be one of the canonical marketplace categories.`
      });
    }

    const generatedSku = sku || `NV-${matchedCategory.slug.substring(0, 3).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const numPrice = Number(price);
    const numOrigPrice = Number(originalPrice) || Math.round(numPrice * 1.4);
    const discount = Math.round((numOrigPrice - numPrice) / numOrigPrice * 100);

    let finalImages = [];
    if (req.file) {
      try {
        const uploadRes = await uploadImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        if (uploadRes && uploadRes.url) {
          finalImages = [uploadRes.url];
        }
      } catch (uploadErr) {
        return res.status(500).json({ success: false, message: `Image upload failed: ${uploadErr.message}` });
      }
    } else if (images) {
      if (Array.isArray(images) && images.length > 0) {
        finalImages = images.filter(Boolean);
      } else if (typeof images === "string" && images.trim().length > 0) {
        finalImages = [images.trim()];
      }
    } else if (req.body.image && typeof req.body.image === "string" && req.body.image.trim().length > 0) {
      finalImages = [req.body.image.trim()];
    }

    if (finalImages.length === 0) {
      finalImages = ["/images/products/placeholder.svg"];
    }

    const newProduct = {
      _id: `prod-${Date.now()}`,
      name: name.trim(),
      slug: `${slug}-${Math.floor(Math.random() * 1e3)}`,
      sku: generatedSku,
      category: matchedCategory.name,
      categorySlug: matchedCategory.slug,
      brand: brand || "Nivora",
      price: numPrice,
      originalPrice: numOrigPrice,
      discount: Math.max(0, discount),
      stock: Number(stock) || 0,
      images: finalImages,
      rating: 4.5,
      reviewCount: 0,
      shortSpec: shortSpec || "",
      description: description || "",
      specifications: specifications || {},
      variants: variants || [],
      isFeatured: Boolean(isFeatured),
      isDeal: Boolean(isDeal),
      deliveryDays: 2,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.products.unshift(newProduct);
    saveDb();
    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const index = db.products.findIndex((p) => p._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    const current = db.products[index];
    const updateData = { ...req.body };
    if (updateData.price && updateData.originalPrice) {
      const p = Number(updateData.price);
      const op = Number(updateData.originalPrice);
      updateData.discount = Math.round((op - p) / op * 100);
    }

    if (updateData.category) {
      const catSearch = updateData.category.toLowerCase().trim();
      const catSlugSearch = (updateData.categorySlug || catSearch.replace(/\s+/g, "-")).toLowerCase().trim();
      const matchedCategory = db.categories.find(
        (c) => c.slug.toLowerCase() === catSlugSearch || c.name.toLowerCase() === catSearch
      );
      if (matchedCategory) {
        updateData.category = matchedCategory.name;
        updateData.categorySlug = matchedCategory.slug;
      }
    }

    if (req.file) {
      try {
        const uploadRes = await uploadImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        if (uploadRes && uploadRes.url) {
          updateData.images = [uploadRes.url];
        }
      } catch (uploadErr) {
        return res.status(500).json({ success: false, message: `Image upload failed: ${uploadErr.message}` });
      }
    } else if (updateData.image) {
      updateData.images = [updateData.image];
    }

    db.products[index] = {
      ...current,
      ...updateData,
      _id: current._id
    };
    saveDb();
    res.json({
      success: true,
      message: "Product updated successfully.",
      product: db.products[index]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p._id !== id);
    if (db.products.length === initialLen) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    saveDb();
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAdminCategories(req, res) {
  try {
    const db = getDb();
    res.json({ success: true, categories: db.categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function createCategory(req, res) {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name required" });
    const db = getDb();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const newCat = {
      _id: `cat-${slug}`,
      name,
      slug,
      icon: icon || "tag",
      description: description || "",
      productCount: 0
    };
    db.categories.push(newCat);
    saveDb();
    res.status(201).json({ success: true, category: newCat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    db.categories = db.categories.filter((c) => c._id !== id && c.slug !== id);
    saveDb();
    res.json({ success: true, message: "Category removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAdminOrders(req, res) {
  try {
    const db = getDb();
    const { status, search } = req.query;
    let orders = [...db.orders];
    if (status && status !== "all") {
      orders = orders.filter((o) => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) => o.orderId.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q) || o.trackingNumber.toLowerCase().includes(q)
      );
    }
    res.json({
      success: true,
      orders,
      total: orders.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const allowed = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status value." });
    }
    const db = getDb();
    const order = db.orders.find((o) => o._id === id || o.orderId === id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    order.status = status;
    order.timeline.push({
      status: status.replace(/_/g, " "),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      note: note || `Order updated to ${status.replace(/_/g, " ")} by warehouse operations.`
    });
    db.notifications.unshift({
      _id: `notif-${Date.now()}`,
      userId: order.userId,
      title: `Order Status Update: ${status.replace(/_/g, " ")}`,
      message: `Your order #${order.orderId} status has been updated to ${status.replace(/_/g, " ")}.`,
      type: "order",
      isRead: false,
      link: `/orders/${order._id}/tracking`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    saveDb();
    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAdminCustomers(req, res) {
  try {
    const db = getDb();
    const customers = db.users.filter((u) => u.role === "user").map((u) => {
      const userOrders = db.orders.filter((o) => o.userId === u._id);
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        addresses: u.addresses || [],
        orderCount: userOrders.length,
        totalSpent,
        createdAt: u.createdAt
      };
    });
    res.json({
      success: true,
      customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAdminInventory(req, res) {
  try {
    const db = getDb();
    const inventory = db.products.map((p) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: p.images[0],
      status: p.stock === 0 ? "Out of Stock" : p.stock <= 20 ? "Low Stock" : "In Stock"
    }));
    res.json({
      success: true,
      inventory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { stock, delta } = req.body;
    const db = getDb();
    const product = db.products.find((p) => p._id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (stock !== void 0) {
      product.stock = Math.max(0, Number(stock));
    } else if (delta !== void 0) {
      product.stock = Math.max(0, product.stock + Number(delta));
    }
    saveDb();
    res.json({
      success: true,
      message: `Stock updated for ${product.name}. Current stock: ${product.stock}`,
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAdminReports(req, res) {
  try {
    const db = getDb();
    const validOrders = db.orders.filter((o) => o.status !== "CANCELLED");
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const avgOrderValue = validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0;
    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      dailyData[key] = { date: label, revenue: 0, orders: 0 };
    }
    for (const order of validOrders) {
      const day = order.createdAt.split("T")[0];
      if (dailyData[day]) {
        dailyData[day].revenue += order.pricing?.total || 0;
        dailyData[day].orders += 1;
      }
    }
    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders: validOrders.length,
        avgOrderValue,
        cancelledOrders: db.orders.filter((o) => o.status === "CANCELLED").length
      },
      salesTrend: Object.values(dailyData)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function uploadImage(req, res) {
  try {
    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
      return res.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        provider: result.provider
      });
    }

    const { url, base64 } = req.body || {};
    if (base64) {
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer;
      let mimetype = "image/jpeg";
      if (matches && matches.length === 3) {
        mimetype = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64, "base64");
      }
      const result = await uploadImageBuffer(buffer, "upload.jpg", mimetype);
      return res.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        provider: result.provider
      });
    }

    if (url && typeof url === "string" && url.trim().length > 0) {
      const cleanUrl = url.trim();
      return res.json({
        success: true,
        url: cleanUrl,
        publicId: `nv_img_${Date.now()}`
      });
    }

    return res.status(400).json({ success: false, message: "No image file or URL provided." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
