import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "customer", "admin"], default: "customer" },
  phone: { type: String, default: "" },
  addresses: [{
    id: String,
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean,
    type: { type: String, enum: ["home", "work"], default: "home" }
  }],
  createdAt: { type: Date, default: Date.now }
});
const ProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  shortSpec: { type: String, default: "" },
  description: { type: String, default: "" },
  specifications: { type: Map, of: String, default: {} },
  variants: [{
    name: String,
    options: [String]
  }],
  isFeatured: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  dealEndsAt: String,
  isTrending: { type: Boolean, default: false },
  deliveryDays: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now }
});
const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: "tag" },
  description: { type: String, default: "" },
  productCount: { type: Number, default: 0 }
});
const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: "" },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    sku: String,
    variant: String
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    type: String
  },
  payment: {
    method: { type: String, enum: ["DEMO_UPI", "DEMO_CARD", "COD"], required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ["COMPLETED", "PENDING", "FAILED"], default: "COMPLETED" },
    paidAt: { type: Date, default: Date.now },
    details: String
  },
  pricing: {
    subtotal: Number,
    discount: Number,
    deliveryCharge: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    default: "PLACED"
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  trackingNumber: String,
  estimatedDelivery: String,
  createdAt: { type: Date, default: Date.now }
});
const ReviewSchema = new Schema({
  productId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const NotificationSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["order", "promo", "account", "system"], default: "order" },
  isRead: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now }
});
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
