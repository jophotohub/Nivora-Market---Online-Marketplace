import bcrypt from "bcryptjs";
import { getDb, saveDb } from "../db/store.js";
import { generateToken } from "../middleware/auth.js";
export async function register(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields."
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }
    const db = getDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please log in."
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // Public customer registration MUST ALWAYS create role = "customer".
    // Client-supplied roles are completely ignored to prevent privilege escalation.
    const newUser = {
      _id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "customer",
      phone: phone || "",
      addresses: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(newUser);
    saveDb();
    db.notifications.push({
      _id: `notif-${Date.now()}`,
      userId: newUser._id,
      title: "Welcome to Nivora Market!",
      message: "Your customer account has been created. Start exploring contractor deals and home essentials today.",
      type: "account",
      isRead: false,
      link: "/products",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    saveDb();
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: "customer",
      name: newUser.name
    });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: "Customer account registered successfully.",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration: " + error.message
    });
  }
}

export async function adminRegister(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address, and password are required."
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match."
      });
    }
    const db = getDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please sign in."
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // Explicitly set role to "admin". Never trust client role.
    const newAdmin = {
      _id: `usr-admin-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      phone: "",
      addresses: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(newAdmin);
    saveDb();

    res.status(201).json({
      success: true,
      message: "Administrator account created successfully. Please sign in."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during admin registration: " + error.message
    });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials."
      });
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials."
      });
    }
    // Customer login endpoint only authenticates normal customer accounts
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrative accounts must sign in through the Admin Portal at /admin/login."
      });
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during authentication: " + error.message
    });
  }
}

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin email and password are required."
      });
    }
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials."
      });
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials."
      });
    }
    // Verify admin role explicitly
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access is required."
      });
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: "admin",
      name: user.name
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Administrator session authorized successfully.",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during admin authentication: " + error.message
    });
  }
}
export async function getMe(req, res) {
  try {
    const db = getDb();
    const user = db.users.find((u) => u._id === req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found."
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile: " + error.message
    });
  }
}
export async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex((u) => u._id === req.user?.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (name) db.users[userIndex].name = name.trim();
    if (phone !== void 0) db.users[userIndex].phone = phone.trim();
    saveDb();
    const { password: _, ...userWithoutPassword } = db.users[userIndex];
    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getAddresses(req, res) {
  try {
    const db = getDb();
    const user = db.users.find((u) => u._id === req.user?.id);
    res.json({
      success: true,
      addresses: user?.addresses || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function addAddress(req, res) {
  try {
    const { fullName, phone, street, city, state, pincode, isDefault, type } = req.body;
    if (!fullName || !phone || !street || !city || !pincode) {
      return res.status(400).json({ success: false, message: "Missing required address fields." });
    }
    const db = getDb();
    const user = db.users.find((u) => u._id === req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.addresses = user.addresses || [];
    if (isDefault) {
      user.addresses.forEach((a) => a.isDefault = false);
    }
    const newAddr = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      street,
      city,
      state: state || "Karnataka",
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
      type: type || "home"
    };
    user.addresses.push(newAddr);
    saveDb();
    res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const db = getDb();
    const user = db.users.find((u) => u._id === req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.addresses = (user.addresses || []).filter((a) => a.id !== addressId);
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    saveDb();
    res.json({
      success: true,
      message: "Address removed.",
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  res.json({
    success: true,
    message: `Password reset instructions and a verification code have been simulated for ${email}.`
  });
}
