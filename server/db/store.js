import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "../seedData.js";
const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "nivora-db.json");
let memoryDb = null;
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Safe fallback if directory creation is restricted
  }
}
export function getDb() {
  if (memoryDb) {
    return memoryDb;
  }
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      memoryDb = JSON.parse(content);
      
      let needsSave = false;
      if (!Array.isArray(memoryDb.categories) || memoryDb.categories.length < SEED_CATEGORIES.length) {
        memoryDb.categories = SEED_CATEGORIES.map((c) => ({
          _id: `cat-${c.slug}`,
          ...c
        }));
        needsSave = true;
      } else {
        for (const sc of SEED_CATEGORIES) {
          const catIdx = memoryDb.categories.findIndex((c) => c.slug === sc.slug);
          if (catIdx !== -1) {
            memoryDb.categories[catIdx].description = sc.description;
            memoryDb.categories[catIdx].name = sc.name;
            memoryDb.categories[catIdx].icon = sc.icon;
          }
        }
        needsSave = true;
      }

      if (!Array.isArray(memoryDb.products)) {
        memoryDb.products = [];
      }

      for (const sp of SEED_PRODUCTS) {
        const existingIdx = memoryDb.products.findIndex((p) => p._id === sp._id || p.slug === sp.slug);
        if (existingIdx === -1) {
          memoryDb.products.push({
            ...sp,
            createdAt: sp.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          });
          needsSave = true;
        } else {
          memoryDb.products[existingIdx].name = sp.name;
          memoryDb.products[existingIdx].sku = sp.sku;
          memoryDb.products[existingIdx].category = sp.category;
          memoryDb.products[existingIdx].categorySlug = sp.categorySlug;
          memoryDb.products[existingIdx].images = sp.images;
          memoryDb.products[existingIdx].brand = sp.brand;
          needsSave = true;
        }
      }

      // Ensure dedicated demo accounts exist idempotently
      if (!Array.isArray(memoryDb.users)) {
        memoryDb.users = [];
      }
      const demoCustEmail = "demo.customer@nivoramarket.com";
      const demoAdminEmail = "demo.admin@nivoramarket.com";
      const salt = bcrypt.genSaltSync(10);

      const hasDemoCust = memoryDb.users.some((u) => u.email.toLowerCase() === demoCustEmail);
      if (!hasDemoCust) {
        memoryDb.users.push({
          _id: "usr-demo-cust-01",
          name: "Demo Customer",
          email: demoCustEmail,
          password: bcrypt.hashSync("Demo@12345", salt),
          role: "customer",
          phone: "+91 98765 11111",
          addresses: [
            {
              id: "addr-demo-01",
              fullName: "Demo Customer",
              phone: "+91 98765 11111",
              street: "24 Nivora Commercial Complex, Brigade Road",
              city: "Bengaluru",
              state: "Karnataka",
              pincode: "560025",
              isDefault: true,
              type: "home"
            }
          ],
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        needsSave = true;
      }

      const hasDemoAdmin = memoryDb.users.some((u) => u.email.toLowerCase() === demoAdminEmail);
      if (!hasDemoAdmin) {
        memoryDb.users.push({
          _id: "usr-demo-admin-01",
          name: "Demo Administrator",
          email: demoAdminEmail,
          password: bcrypt.hashSync("Demo@12345", salt),
          role: "admin",
          phone: "+91 98765 00000",
          addresses: [
            {
              id: "addr-demo-admin-01",
              fullName: "Nivora Admin HQ",
              phone: "+91 98765 00000",
              street: "Level 8, Nivora Tech Tower, Cyber City",
              city: "Gurugram",
              state: "Haryana",
              pincode: "122002",
              isDefault: true,
              type: "work"
            }
          ],
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        needsSave = true;
      }

      if (needsSave) {
        saveDb();
      }
      return memoryDb;
    } catch (e) {
      console.warn("Could not parse existing db file, re-initializing store", e);
    }
  }
  const salt = bcrypt.genSaltSync(10);
  const adminHashedPassword = bcrypt.hashSync("admin123", salt);
  const customerHashedPassword = bcrypt.hashSync("customer123", salt);
  const initialUsers = [
    {
      _id: "usr-admin-01",
      name: "Nivora Admin",
      email: "admin@nivoramarket.com",
      password: adminHashedPassword,
      role: "admin",
      phone: "+91 98765 00001",
      addresses: [
        {
          id: "addr-01",
          fullName: "Nivora HQ Administration",
          phone: "+91 98765 00001",
          street: "Block 4, Industrial Tech Park, Sector 62",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301",
          isDefault: true,
          type: "work"
        }
      ],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      _id: "usr-cust-01",
      name: "Rajesh Kumar",
      email: "customer@nivoramarket.com",
      password: customerHashedPassword,
      role: "user",
      phone: "+91 98765 43210",
      addresses: [
        {
          id: "addr-02",
          fullName: "Rajesh Kumar",
          phone: "+91 98765 43210",
          street: "Flat 302, Green Valley Apartments, MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          isDefault: true,
          type: "home"
        },
        {
          id: "addr-03",
          fullName: "Rajesh Kumar (Work)",
          phone: "+91 98765 43210",
          street: "Nivora Electrical Workshop, Peenya Industrial Area",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560058",
          isDefault: false,
          type: "work"
        }
      ],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  const initialProducts = SEED_PRODUCTS.map((p) => ({
    ...p,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }));
  const initialCategories = SEED_CATEGORIES.map((c) => ({
    _id: `cat-${c.slug}`,
    ...c
  }));
  const initialOrders = [
    {
      _id: "ord-10001",
      orderId: "NIV-ORD-77821",
      userId: "usr-cust-01",
      customerName: "Rajesh Kumar",
      customerEmail: "customer@nivoramarket.com",
      customerPhone: "+91 98765 43210",
      items: [
        {
          productId: "prod-001",
          name: "Pro-Duty 20V Cordless Brushless Drill Driver Kit",
          price: 3899,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
          sku: "NV-TLS-8821",
          variant: "Standard (2 Batteries)"
        },
        {
          productId: "prod-005",
          name: "Heavy-Duty Nitrile Coated Safety Work Gloves (Pack of 6 Pairs)",
          price: 499,
          quantity: 2,
          image: "/images/products/nitrile-work-gloves.jpg",
          sku: "NV-TLS-1205",
          variant: "Large (9)"
        }
      ],
      shippingAddress: {
        fullName: "Rajesh Kumar",
        phone: "+91 98765 43210",
        street: "Flat 302, Green Valley Apartments, MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        type: "home"
      },
      payment: {
        method: "DEMO_UPI",
        transactionId: "DEMO-TXN-10001",
        status: "COMPLETED",
        paidAt: new Date(Date.now() - 36 * 3600 * 1e3).toISOString(),
        details: "Simulated UPI payment via test@okhdfcbank"
      },
      pricing: {
        subtotal: 4897,
        discount: 200,
        deliveryCharge: 0,
        total: 4697
      },
      status: "SHIPPED",
      timeline: [
        {
          status: "Order Placed",
          timestamp: new Date(Date.now() - 36 * 3600 * 1e3).toISOString(),
          note: "Order successfully created with simulated payment."
        },
        {
          status: "Confirmed",
          timestamp: new Date(Date.now() - 32 * 3600 * 1e3).toISOString(),
          note: "Seller confirmed order and allocated inventory."
        },
        {
          status: "Packed",
          timestamp: new Date(Date.now() - 20 * 3600 * 1e3).toISOString(),
          note: "Goods inspected, packed in Nivora tamper-proof box."
        },
        {
          status: "Shipped",
          timestamp: new Date(Date.now() - 8 * 3600 * 1e3).toISOString(),
          note: "Handed over to Nivora Express Logistics (AWB: NV8839210)."
        }
      ],
      trackingNumber: "NV8839210",
      estimatedDelivery: "Wednesday, Oct 1",
      createdAt: new Date(Date.now() - 36 * 3600 * 1e3).toISOString()
    }
  ];
  const initialReviews = [
    {
      _id: "rev-01",
      productId: "prod-001",
      userId: "usr-cust-01",
      userName: "Rajesh Kumar",
      rating: 5,
      title: "Monster torque, easily handled 3-inch screws!",
      comment: "The brushless motor on this Nivora drill is phenomenal. Ran all day building heavy wooden shelves without overheating. The 2 batteries charge in under 45 minutes.",
      createdAt: new Date(Date.now() - 24 * 3600 * 1e3).toISOString()
    },
    {
      _id: "rev-02",
      productId: "prod-002",
      userId: "usr-cust-01",
      userName: "Amit S.",
      rating: 5,
      title: "Looks super premium on the living room wall",
      comment: "Glass panel finish gives a 5-star hotel look to the room. The soft orange indicator is easy to locate in pitch darkness.",
      createdAt: new Date(Date.now() - 48 * 3600 * 1e3).toISOString()
    }
  ];
  const initialNotifications = [
    {
      _id: "notif-01",
      userId: "usr-cust-01",
      title: "Order Shipped!",
      message: "Your order #NIV-ORD-77821 is out for transit with Nivora Express. Estimated delivery: Oct 1.",
      type: "order",
      isRead: false,
      link: "/orders/ord-10001/tracking",
      createdAt: new Date(Date.now() - 8 * 3600 * 1e3).toISOString()
    },
    {
      _id: "notif-02",
      userId: "usr-cust-01",
      title: "Welcome to Nivora Market!",
      message: "Use coupon code NIVORA10 during checkout to get 10% instant discount on your orders.",
      type: "promo",
      isRead: true,
      link: "/products",
      createdAt: new Date(Date.now() - 72 * 3600 * 1e3).toISOString()
    }
  ];
  const initialCoupons = [
    { code: "NIVORA10", discountPercent: 10, minOrder: 500, maxDiscount: 500 },
    { code: "FIRST50", discountFlat: 50, minOrder: 299 },
    { code: "SUPERTOOL", discountPercent: 15, minOrder: 2e3, maxDiscount: 1e3 }
  ];
  memoryDb = {
    users: initialUsers,
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    carts: {
      "usr-cust-01": [
        {
          productId: "prod-004",
          quantity: 1,
          variant: void 0
        }
      ]
    },
    wishlists: {
      "usr-cust-01": ["prod-002", "prod-008"]
    },
    reviews: initialReviews,
    notifications: initialNotifications,
    coupons: initialCoupons
  };
  saveDb();
  return memoryDb;
}
export function saveDb() {
  if (!memoryDb) return;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf-8");
  } catch (err) {
    // In-memory data store remains active and healthy even if disk write is not allowed
  }
}
