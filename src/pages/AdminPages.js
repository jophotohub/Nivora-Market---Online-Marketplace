import { apiRequest, setToken, removeToken } from "../services/api.js";
import { formatPrice, formatDate } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { setUser, initAppState } from "../services/state.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router.js";
export function renderAdminLogin() {
  return `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
        <!-- Nivora Logo & Administration Branding -->
        <a href="/" data-link class="inline-flex items-center gap-2.5 group">
          <div class="w-11 h-11 bg-orange-600 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
            N
          </div>
          <div class="flex flex-col text-left leading-none">
            <span class="text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
              Nivora Market
            </span>
            <span class="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
              ADMINISTRATION
            </span>
          </div>
        </a>
        <p class="text-xs text-slate-400">
          Restricted administrative access for inventory, orders & marketplace management
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold text-slate-300">
            ${icon("shield", "w-4 h-4 text-orange-500")}
            <span>Administrative Sign In</span>
          </div>

          <form id="admin-login-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                id="admin-email"
                placeholder="admin@nivoramarket.com"
                class="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 outline-hidden font-mono"
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                id="admin-password"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                class="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 outline-hidden font-mono"
                required
              />
            </div>

            <button
              type="submit"
              id="admin-submit-btn"
              class="w-full py-3 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Admin Sign In</span>
              ${icon("arrowRight", "w-4 h-4")}
            </button>
          </form>

          <div class="pt-3 border-t border-slate-800 text-center space-y-2.5">
            <div>
              <a
                href="/admin/register"
                data-link
                id="goto-admin-register-btn"
                class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ${icon("user", "w-3.5 h-3.5 text-orange-500")}
                <span>Create New Admin Account</span>
              </a>
            </div>
            <div>
              <a href="/" data-link class="text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors inline-block">
                &larr; Return to Customer Storefront
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderAdminRegister() {
  return `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
        <!-- Nivora Logo & Administration Branding -->
        <a href="/" data-link class="inline-flex items-center gap-2.5 group">
          <div class="w-11 h-11 bg-orange-600 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
            N
          </div>
          <div class="flex flex-col text-left leading-none">
            <span class="text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
              Nivora Market
            </span>
            <span class="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
              ADMINISTRATION
            </span>
          </div>
        </a>
        <p class="text-xs text-slate-400">
          Create a new administrative account for marketplace management and operations
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold text-slate-300">
            ${icon("shield", "w-4 h-4 text-orange-500")}
            <span>Create Administrator Account</span>
          </div>

          <!-- Inline Error / Status Box -->
          <div id="admin-reg-error-box" class="hidden p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium"></div>

          <form id="admin-register-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                id="admin-reg-name"
                placeholder="e.g. Senthil Nathan"
                class="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 outline-hidden"
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                id="admin-reg-email"
                placeholder="e.g. admin.ops@nivoramarket.com"
                class="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 outline-hidden font-mono"
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-300 mb-1.5">Password (min 6 characters)</label>
              <input
                type="password"
                id="admin-reg-password"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                class="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 outline-hidden font-mono"
                required
                minlength="6"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                id="admin-reg-confirm-password"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                class="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-3.5 py-2.5 outline-hidden font-mono"
                required
                minlength="6"
              />
            </div>

            <button
              type="submit"
              id="admin-reg-submit-btn"
              class="w-full py-3 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create Admin Account</span>
              ${icon("arrowRight", "w-4 h-4")}
            </button>
          </form>

          <div class="pt-4 border-t border-slate-800 text-center space-y-2">
            <div>
              <span class="text-xs text-slate-400">Already have an admin account?</span>
              <a href="/admin/login" data-link class="text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline ml-1">
                Sign In
              </a>
            </div>
            <div>
              <a href="/" data-link class="text-xs font-semibold text-slate-500 hover:text-orange-400 transition-colors inline-block">
                &larr; Return to Customer Storefront
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachAdminRegisterEvents() {
  const form = document.getElementById("admin-register-form");
  const nameInput = document.getElementById("admin-reg-name");
  const emailInput = document.getElementById("admin-reg-email");
  const passInput = document.getElementById("admin-reg-password");
  const confirmPassInput = document.getElementById("admin-reg-confirm-password");
  const submitBtn = document.getElementById("admin-reg-submit-btn");
  const errorBox = document.getElementById("admin-reg-error-box");

  let isSubmitting = false;

  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove("hidden");
    }
    showToast(msg, "error");
  };

  const hideError = () => {
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.classList.add("hidden");
    }
  };

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      hideError();

      const name = nameInput?.value.trim();
      const email = emailInput?.value.trim();
      const password = passInput?.value;
      const confirmPassword = confirmPassInput?.value;

      if (!name) {
        showError("Full Name is required.");
        return;
      }
      if (!email || !email.includes("@")) {
        showError("A valid Admin Email address is required.");
        return;
      }
      if (!password || password.length < 6) {
        showError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        showError("Passwords do not match. Please verify.");
        return;
      }

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Creating Admin Account...</span>`;

      try {
        const res = await apiRequest("/auth/admin/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password, confirmPassword })
        });

        if (res.success) {
          showToast(res.message || "Administrator account created successfully. Please sign in.", "success");
          navigate("/admin/login");
        } else {
          showError(res.message || "Admin registration failed. Please try again.");
          isSubmitting = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Create Admin Account</span>${icon("arrowRight", "w-4 h-4")}`;
        }
      } catch (err) {
        showError("Network error or server unavailable. Please try again.");
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Admin Account</span>${icon("arrowRight", "w-4 h-4")}`;
      }
    };
  }
}
export function attachAdminLoginEvents() {
  const form = document.getElementById("admin-login-form");
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const submitBtn = document.getElementById("admin-submit-btn");

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!emailInput || !passwordInput) return;
      submitBtn.disabled = true;
      submitBtn.textContent = "Verifying Admin Privileges...";
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      const res = await apiRequest("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (res.success && res.token && res.user) {
        if (res.user.role !== "admin") {
          showToast("Admin access is required.", "error");
          submitBtn.disabled = false;
          submitBtn.textContent = "Admin Sign In";
          return;
        }
        setToken(res.token);
        setUser(res.user);
        await initAppState();
        showToast("Administrator authorized successfully.", "success");
        navigate("/admin/dashboard");
      } else {
        showToast(res.message || "Admin access is required.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Admin Sign In";
      }
    };
  }
}
function renderAdminNavigation(activeSection) {
  const links = [
    { label: "Dashboard", path: "/admin/dashboard", id: "dashboard", iconName: "grid" },
    { label: "Products", path: "/admin/products", id: "products", iconName: "package" },
    { label: "Categories", path: "/admin/categories", id: "categories", iconName: "tag" },
    { label: "Orders", path: "/admin/orders", id: "orders", iconName: "truck" },
    { label: "Customers", path: "/admin/customers", id: "customers", iconName: "user" },
    { label: "Inventory", path: "/admin/inventory", id: "inventory", iconName: "wrench" },
    { label: "Reports", path: "/admin/reports", id: "reports", iconName: "activity" }
  ];
  return `
    <div class="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a href="/admin/dashboard" data-link class="flex items-center gap-2">
            <div class="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-black text-white text-base">N</div>
            <span class="font-extrabold text-base tracking-tight text-white hidden sm:inline">Nivora Admin</span>
          </a>
        </div>

        <div class="flex items-center gap-2.5 text-xs">
          <a href="/" data-link class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
            Exit to Marketplace
          </a>
          <button id="admin-logout-btn" type="button" class="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5">
            ${icon("arrowRight", "w-3.5 h-3.5")}
            <span>Admin Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Subnav Tabs -->
    <div class="bg-white border-b border-slate-200 px-4 shadow-2xs">
      <div class="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-bold">
        ${links.map((l) => `
          <a
            href="${l.path}"
            data-link
            class="px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${activeSection === l.id ? "bg-orange-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}"
          >
            ${l.label}
          </a>
        `).join("")}
      </div>
    </div>
  `;
}
export async function renderAdminDashboard() {
  const res = await apiRequest("/admin/dashboard");
  if (!res.success) {
    navigate("/admin/login");
    return "";
  }
  const { stats, recentOrders = [], topProducts = [], categorySales = {} } = res;
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("dashboard")}
      
      <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Marketplace Operations Overview</h1>
          <p class="text-xs text-slate-500">Live operational metrics, sales volume, and order throughput</p>
        </div>

        <!-- 5 Key Metrics Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
            <div class="text-2xl font-black text-slate-900">${formatPrice(stats.totalRevenue)}</div>
            <div class="text-[11px] text-emerald-600 font-bold">Simulated Collections</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div class="text-2xl font-black text-slate-900">${stats.totalOrders}</div>
            <div class="text-[11px] text-blue-600 font-bold">${stats.pendingOrders} Pending Fulfillment</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Catalog</span>
            <div class="text-2xl font-black text-slate-900">${stats.totalProducts}</div>
            <div class="text-[11px] text-slate-500 font-medium">SKUs Listed</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Customers</span>
            <div class="text-2xl font-black text-slate-900">${stats.totalCustomers}</div>
            <div class="text-[11px] text-emerald-600 font-bold">Registered Buyers</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alert</span>
            <div class="text-2xl font-black text-amber-600">${stats.lowStockProducts}</div>
            <div class="text-[11px] text-red-600 font-bold">${stats.outOfStockProducts} Out of Stock</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Recent Orders Table -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 class="text-sm font-black text-slate-900">Recent Customer Orders</h2>
              <a href="/admin/orders" data-link class="text-xs font-bold text-orange-600 hover:underline">View All Orders</a>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th class="p-3">Order ID</th>
                    <th class="p-3">Customer</th>
                    <th class="p-3">Items</th>
                    <th class="p-3">Total</th>
                    <th class="p-3">Status</th>
                    <th class="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${recentOrders.map((ord) => `
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="p-3 font-mono font-bold text-slate-900">#${ord.orderId}</td>
                      <td class="p-3 font-medium text-slate-800">${ord.customerName}</td>
                      <td class="p-3 text-slate-500">${ord.itemCount}</td>
                      <td class="p-3 font-black text-slate-900">${formatPrice(ord.total)}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${ord.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : ord.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}">
                          ${ord.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td class="p-3 text-right">
                        <a href="/orders/${ord._id}/tracking" data-link class="font-bold text-orange-600 hover:underline">
                          View
                        </a>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Category Share & Top Products -->
          <div class="space-y-6">
            <!-- Top Products -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h2 class="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">Top Sellers</h2>
              <div class="space-y-3">
                ${topProducts.map((tp) => `
                  <div class="flex items-center justify-between gap-3 text-xs">
                    <div class="truncate font-bold text-slate-800">${tp.product.name}</div>
                    <div class="text-right flex-shrink-0">
                      <div class="font-black text-slate-900">${formatPrice(tp.revenue)}</div>
                      <div class="text-[10px] text-slate-400">${tp.unitsSold} units</div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Category Revenue Breakdown -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h2 class="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">Sales by Category</h2>
              <div class="space-y-2">
                ${Object.entries(categorySales).map(([cat, rev]) => `
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-600 font-medium">${cat}</span>
                    <span class="font-bold text-slate-900">${formatPrice(rev)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}
export async function renderAdminProducts() {
  const res = await apiRequest("/admin/products");
  const products = res.success ? res.products : [];
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("products")}

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Product Catalog Management</h1>
            <p class="text-xs text-slate-500">Manage SKUs, stock levels, wholesale pricing, and media assets</p>
          </div>

          <button id="open-new-product-modal-btn" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer">
            ${icon("plus", "w-4 h-4")}
            <span>Add New Product</span>
          </button>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">Product Details</th>
                  <th class="p-4">SKU</th>
                  <th class="p-4">Category</th>
                  <th class="p-4">Price</th>
                  <th class="p-4">Stock</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${products.map((p) => `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <img src="${getProductImage(p)}" alt="${p.name}" ${IMAGE_FALLBACK_ATTR} class="w-10 h-10 object-contain bg-slate-50 p-1 rounded-md border border-slate-200 flex-shrink-0" />
                        <div>
                          <div class="font-bold text-slate-900 max-w-xs truncate">${p.name}</div>
                          <div class="text-[10px] text-slate-400 font-bold uppercase">${p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td class="p-4 font-mono text-slate-600">${p.sku}</td>
                    <td class="p-4 font-medium text-slate-700">${p.category}</td>
                    <td class="p-4 font-black text-slate-900">${formatPrice(p.price)}</td>
                    <td class="p-4 font-bold text-slate-900">${p.stock} units</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${p.stock === 0 ? "bg-red-100 text-red-800" : p.stock <= 20 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}">
                        ${p.stock === 0 ? "Out of Stock" : p.stock <= 20 ? "Low Stock" : "Active"}
                      </span>
                    </td>
                    <td class="p-4 text-right space-x-2">
                      <button class="admin-edit-prod-btn text-blue-600 hover:text-blue-800 font-bold" data-id="${p._id}">
                        Edit
                      </button>
                      <button class="admin-delete-prod-btn text-red-600 hover:text-red-800 font-bold" data-id="${p._id}">
                        Delete
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}
export async function renderAdminOrders() {
  const res = await apiRequest("/admin/orders");
  const orders = res.success ? res.orders : [];
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("orders")}

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div class="pb-4 border-b border-slate-200">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Order Fulfillment & Dispatch</h1>
          <p class="text-xs text-slate-500">Update live shipping milestones and manage customer dispatches</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">Order ID & Date</th>
                  <th class="p-4">Customer</th>
                  <th class="p-4">Shipping Destination</th>
                  <th class="p-4">Total</th>
                  <th class="p-4">Payment</th>
                  <th class="p-4">Update Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${orders.map((o) => `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 space-y-0.5">
                      <div class="font-mono font-bold text-slate-900">#${o.orderId}</div>
                      <div class="text-[10px] text-slate-400">${formatDate(o.createdAt)}</div>
                    </td>
                    <td class="p-4 space-y-0.5">
                      <div class="font-bold text-slate-900">${o.customerName}</div>
                      <div class="text-[10px] text-slate-400">${o.customerEmail}</div>
                    </td>
                    <td class="p-4 text-slate-600 max-w-xs truncate">
                      ${o.shippingAddress?.street}, ${o.shippingAddress?.city}
                    </td>
                    <td class="p-4 font-black text-slate-900">
                      ${formatPrice(o.pricing?.total || 0)}
                    </td>
                    <td class="p-4">
                      <span class="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                        ${o.payment?.method}
                      </span>
                    </td>
                    <td class="p-4">
                      <select class="admin-status-select bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer" data-id="${o._id}">
                        <option value="PLACED" ${o.status === "PLACED" ? "selected" : ""}>Placed</option>
                        <option value="CONFIRMED" ${o.status === "CONFIRMED" ? "selected" : ""}>Confirmed</option>
                        <option value="PACKED" ${o.status === "PACKED" ? "selected" : ""}>Packed</option>
                        <option value="SHIPPED" ${o.status === "SHIPPED" ? "selected" : ""}>Shipped</option>
                        <option value="OUT_FOR_DELIVERY" ${o.status === "OUT_FOR_DELIVERY" ? "selected" : ""}>Out for Delivery</option>
                        <option value="DELIVERED" ${o.status === "DELIVERED" ? "selected" : ""}>Delivered</option>
                        <option value="CANCELLED" ${o.status === "CANCELLED" ? "selected" : ""}>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}
export async function renderAdminCategories() {
  const res = await apiRequest("/admin/categories");
  const categories = res.success ? res.categories : [];
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("categories")}

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Marketplace Categories</h1>
            <p class="text-xs text-slate-500">Manage category taxonomies and product distribution</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${categories.map((cat) => `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  ${icon(cat.icon || "tag", "w-5 h-5")}
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 text-sm">${cat.name}</h3>
                  <div class="text-xs text-slate-400 font-medium">${cat.productCount || 0} products</div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}
export async function renderAdminCustomers() {
  const res = await apiRequest("/admin/customers");
  const customers = res.success ? res.customers : [];
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("customers")}

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div class="pb-4 border-b border-slate-200">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Registered Customers</h1>
          <p class="text-xs text-slate-500">View customer account profiles, order histories, and purchase values</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">Customer Name</th>
                  <th class="p-4">Email</th>
                  <th class="p-4">Phone</th>
                  <th class="p-4">Orders Placed</th>
                  <th class="p-4">Total Spent</th>
                  <th class="p-4">Joined</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${customers.map((c) => `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-bold text-slate-900">${c.name}</td>
                    <td class="p-4 text-slate-600">${c.email}</td>
                    <td class="p-4 text-slate-600">${c.phone || "N/A"}</td>
                    <td class="p-4 font-bold text-slate-900">${c.orderCount}</td>
                    <td class="p-4 font-black text-slate-900">${formatPrice(c.totalSpent)}</td>
                    <td class="p-4 text-slate-400">${formatDate(c.createdAt)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}
export async function renderAdminInventory() {
  const res = await apiRequest("/admin/inventory");
  const inventory = res.success ? res.inventory : [];
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("inventory")}

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div class="pb-4 border-b border-slate-200">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Warehouse Inventory Control</h1>
          <p class="text-xs text-slate-500">Quick stock replenishment, low-stock warnings, and reserve levels</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">Product</th>
                  <th class="p-4">SKU</th>
                  <th class="p-4">Category</th>
                  <th class="p-4">Current Stock</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${inventory.map((item) => `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <img src="${getProductImage(item.image)}" alt="${item.name}" ${IMAGE_FALLBACK_ATTR} class="w-8 h-8 object-contain bg-slate-50 rounded border border-slate-200" />
                        <span class="font-bold text-slate-900 max-w-xs truncate">${item.name}</span>
                      </div>
                    </td>
                    <td class="p-4 font-mono text-slate-600">${item.sku}</td>
                    <td class="p-4 text-slate-600">${item.category}</td>
                    <td class="p-4 font-black text-slate-900 text-sm">${item.stock}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.stock === 0 ? "bg-red-100 text-red-800" : item.stock <= 20 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}">
                        ${item.status}
                      </span>
                    </td>
                    <td class="p-4 text-right space-x-1">
                      <button class="inventory-adjust-btn px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded" data-id="${item._id}" data-delta="10">
                        +10
                      </button>
                      <button class="inventory-adjust-btn px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded" data-id="${item._id}" data-delta="-10">
                        -10
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}
export async function renderAdminReports() {
  const res = await apiRequest("/admin/reports");
  const summary = res.summary || {};
  const salesTrend = res.salesTrend || [];
  return `
    <div class="min-h-screen bg-slate-50">
      ${renderAdminNavigation("reports")}

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div class="pb-4 border-b border-slate-200">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Marketplace Analytics & Reports</h1>
          <p class="text-xs text-slate-500">Order revenue trends and financial metrics</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase">Total Revenue</span>
            <div class="text-3xl font-black text-slate-900">${formatPrice(summary.totalRevenue || 0)}</div>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase">Average Order Value</span>
            <div class="text-3xl font-black text-slate-900">${formatPrice(summary.avgOrderValue || 0)}</div>
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span class="text-xs font-bold text-slate-500 uppercase">Total Completed Orders</span>
            <div class="text-3xl font-black text-emerald-600">${summary.totalOrders || 0}</div>
          </div>
        </div>

        <!-- 7-Day Performance Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h2 class="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">7-Day Sales Volume</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th class="p-3">Timeline Date</th>
                  <th class="p-3">Orders Created</th>
                  <th class="p-3 text-right">Revenue Recorded</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${salesTrend.map((d) => `
                  <tr>
                    <td class="p-3 font-bold text-slate-900">${d.date}</td>
                    <td class="p-3 text-slate-600">${d.orders} orders</td>
                    <td class="p-3 text-right font-black text-slate-900">${formatPrice(d.revenue)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;
}
export function attachAdminEvents(section) {
  const adminLogoutBtn = document.getElementById("admin-logout-btn");
  if (adminLogoutBtn) {
    adminLogoutBtn.onclick = () => {
      removeToken();
      setUser(null);
      showToast("Admin session ended.", "info");
      navigate("/admin/login");
    };
  }
  if (section === "orders") {
    document.querySelectorAll(".admin-status-select").forEach((select) => {
      select.onchange = async () => {
        const orderId = select.getAttribute("data-id");
        const status = select.value;
        if (!orderId) return;
        const res = await apiRequest(`/admin/orders/${orderId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status })
        });
        if (res.success) {
          showToast(`Order status updated to ${status}`, "success");
        } else {
          showToast(res.message || "Status update failed", "error");
        }
      };
    });
  }
  if (section === "inventory") {
    document.querySelectorAll(".inventory-adjust-btn").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        const delta = parseInt(btn.getAttribute("data-delta") || "0", 10);
        if (!id) return;
        const res = await apiRequest(`/admin/inventory/${id}/stock`, {
          method: "PUT",
          body: JSON.stringify({ delta })
        });
        if (res.success) {
          showToast(res.message, "success");
          renderAdminInventory().then((html) => {
            const app = document.getElementById("app-content");
            if (app) {
              app.innerHTML = html;
              attachAdminEvents("inventory");
            }
          });
        }
      };
    });
  }
  if (section === "products") {
    document.querySelectorAll(".admin-delete-prod-btn").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        if (confirm("Delete this product from catalog?")) {
          const res = await apiRequest(`/admin/products/${id}`, { method: "DELETE" });
          if (res.success) {
            showToast("Product removed", "info");
            renderAdminProducts().then((html) => {
              const app = document.getElementById("app-content");
              if (app) {
                app.innerHTML = html;
                attachAdminEvents("products");
              }
            });
          }
        }
      };
    });
    const addBtn = document.getElementById("open-new-product-modal-btn");
    if (addBtn) {
      addBtn.onclick = () => {
        openAddProductModal();
      };
    }
    document.querySelectorAll(".admin-edit-prod-btn").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        const res = await apiRequest(`/products/${id}`);
        if (res.success && res.product) {
          openEditProductModal(res.product);
        }
      };
    });
  }
}
function openAddProductModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;
  modalContainer.innerHTML = `
    <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 class="text-base font-black text-slate-900">Add New Marketplace Product</h2>
        <button id="close-modal-btn" class="text-slate-400 hover:text-slate-600">${icon("x", "w-5 h-5")}</button>
      </div>

      <form id="create-product-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Product Title</label>
          <input type="text" id="new-prod-name" placeholder="e.g. 20V Cordless Angle Grinder" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Category</label>
            <select id="new-prod-category" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden">
              <option value="Computers">Computers</option>
              <option value="Electronics">Electronics</option>
              <option value="Mobiles">Mobiles</option>
              <option value="Tools">Tools</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Home Appliances">Home Appliances</option>
              <option value="Furniture">Furniture</option>
              <option value="Automotive">Automotive</option>
              <option value="Beauty">Beauty</option>
              <option value="Fashion">Fashion</option>
              <option value="Grocery">Grocery</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Brand</label>
            <input type="text" id="new-prod-brand" placeholder="e.g. NivoraPro" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Sale Price (\u20B9)</label>
            <input type="number" id="new-prod-price" placeholder="2499" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">MRP Price (\u20B9)</label>
            <input type="number" id="new-prod-orig-price" placeholder="3999" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Stock Quantity</label>
            <input type="number" id="new-prod-stock" placeholder="50" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
          </div>
        </div>

        <!-- Local Product Image Upload Section -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Product Image</label>
          <div class="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-4 bg-slate-50 transition-colors">
            
            <!-- Image Preview Box -->
            <div id="new-prod-preview-box" class="hidden flex-col items-center gap-2 mb-3">
              <div class="relative w-36 h-36 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs">
                <img id="new-prod-preview-img" src="" alt="Product Preview" class="w-full h-full object-contain p-2" />
                <button type="button" id="new-prod-remove-img-btn" class="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-sm transition-colors cursor-pointer" title="Remove image">
                  ${icon("x", "w-3.5 h-3.5")}
                </button>
              </div>
              <span id="new-prod-file-label" class="text-[11px] text-slate-600 font-medium"></span>
            </div>

            <!-- Upload Controls -->
            <div id="new-prod-upload-prompt" class="flex flex-col items-center justify-center gap-2 text-center py-2">
              <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                ${icon("uploadCloud", "w-5 h-5")}
              </div>
              <div>
                <input type="file" id="new-prod-file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" />
                <button type="button" id="new-prod-choose-btn" class="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer">
                  ${icon("image", "w-4 h-4")}
                  <span>Choose Product Image</span>
                </button>
              </div>
              <p class="text-[11px] text-slate-400">Accepted formats: JPG, JPEG, PNG, WEBP (Max 5 MB)</p>
            </div>

          </div>

          <!-- Optional Legacy URL fallback -->
          <div class="mt-2">
            <button type="button" id="new-prod-toggle-url-btn" class="text-[11px] text-slate-500 hover:text-orange-600 font-medium inline-flex items-center gap-1 cursor-pointer">
              <span>Or enter direct Image URL (Optional)</span>
              ${icon("chevronDown", "w-3 h-3")}
            </button>
            <div id="new-prod-url-container" class="hidden mt-1.5">
              <input type="url" id="new-prod-image-url" placeholder="https://res.cloudinary.com/... or /images/products/..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-hidden" />
            </div>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Short Specification Line</label>
          <input type="text" id="new-prod-spec" placeholder="11000 RPM | 125mm Disc | Anti-Vibration Handle" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Detailed Description</label>
          <textarea id="new-prod-desc" rows="3" placeholder="Full technical product description..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden"></textarea>
        </div>

        <!-- Upload Status Message Container -->
        <div id="create-upload-status" class="hidden p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium flex items-center gap-2">
          <div class="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <span id="create-upload-status-text">Uploading image to Cloudinary...</span>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" id="submit-create-prod-btn" class="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs">
            Publish Product
          </button>
          <button type="button" id="modal-cancel-btn" class="px-5 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  modalContainer.classList.remove("hidden");
  const close = () => modalContainer.classList.add("hidden");
  document.getElementById("close-modal-btn").onclick = close;
  document.getElementById("modal-cancel-btn").onclick = close;

  // File selection & validation
  const fileInput = document.getElementById("new-prod-file");
  const chooseBtn = document.getElementById("new-prod-choose-btn");
  const previewBox = document.getElementById("new-prod-preview-box");
  const previewImg = document.getElementById("new-prod-preview-img");
  const fileLabel = document.getElementById("new-prod-file-label");
  const uploadPrompt = document.getElementById("new-prod-upload-prompt");
  const removeImgBtn = document.getElementById("new-prod-remove-img-btn");
  const toggleUrlBtn = document.getElementById("new-prod-toggle-url-btn");
  const urlContainer = document.getElementById("new-prod-url-container");
  const imageUrlInput = document.getElementById("new-prod-image-url");

  let selectedFile = null;

  chooseBtn.onclick = () => fileInput.click();

  toggleUrlBtn.onclick = () => {
    urlContainer.classList.toggle("hidden");
  };

  fileInput.onchange = () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showToast("Invalid file type. Please select a JPG, JPEG, PNG, or WEBP image.", "error");
      fileInput.value = "";
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size exceeds 5 MB limit. Please select a smaller image.", "error");
      fileInput.value = "";
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      fileLabel.textContent = `${file.name} (${sizeMB} MB)`;
      previewBox.classList.remove("hidden");
      previewBox.classList.add("flex");
      uploadPrompt.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  };

  removeImgBtn.onclick = () => {
    selectedFile = null;
    fileInput.value = "";
    previewImg.src = "";
    previewBox.classList.add("hidden");
    previewBox.classList.remove("flex");
    uploadPrompt.classList.remove("hidden");
  };

  const form = document.getElementById("create-product-form");
  const submitBtn = document.getElementById("submit-create-prod-btn");
  const statusBox = document.getElementById("create-upload-status");
  const statusText = document.getElementById("create-upload-status-text");

  let isSubmitting = false;

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = document.getElementById("new-prod-name").value.trim();
    const category = document.getElementById("new-prod-category").value;
    const brand = document.getElementById("new-prod-brand").value.trim();
    const price = document.getElementById("new-prod-price").value;
    const originalPrice = document.getElementById("new-prod-orig-price").value;
    const stock = document.getElementById("new-prod-stock").value;
    const shortSpec = document.getElementById("new-prod-spec").value.trim();
    const description = document.getElementById("new-prod-desc").value.trim();
    const fallbackUrl = imageUrlInput?.value.trim() || "";

    if (!name || !price || !category) {
      showToast("Please fill in Product Name, Category, and Price.", "error");
      return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");

    let finalImageUrl = fallbackUrl || "/images/products/placeholder.svg";

    // If local file selected, upload through server to Cloudinary first
    if (selectedFile) {
      statusBox.classList.remove("hidden");
      statusText.textContent = "Uploading image to Cloudinary...";

      const formData = new FormData();
      formData.append("image", selectedFile);

      const uploadRes = await apiRequest("/admin/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadRes.success || !uploadRes.url) {
        statusBox.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        isSubmitting = false;
        showToast(`Image upload failed: ${uploadRes.message || "Could not upload image"}. Product was not created.`, "error");
        return;
      }

      finalImageUrl = uploadRes.url;
      statusText.textContent = "Saving product to MongoDB...";
    }

    // Now save product to MongoDB
    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
    const res = await apiRequest("/admin/products", {
      method: "POST",
      body: JSON.stringify({
        name,
        category,
        categorySlug,
        brand,
        price,
        originalPrice,
        stock,
        images: [finalImageUrl],
        shortSpec,
        description
      })
    });

    statusBox.classList.add("hidden");
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    isSubmitting = false;

    if (res.success) {
      showToast("Product created successfully with verified image!", "success");
      close();
      renderAdminProducts().then((html) => {
        const app = document.getElementById("app-content");
        if (app) {
          app.innerHTML = html;
          attachAdminEvents("products");
        }
      });
    } else {
      showToast(res.message || "Failed to create product in database", "error");
    }
  };
}

function openEditProductModal(product) {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;
  const currentImage = product.images?.[0] || "/images/products/placeholder.svg";

  modalContainer.innerHTML = `
    <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 class="text-base font-black text-slate-900">Edit Product: ${product.name}</h2>
        <button id="close-modal-btn" class="text-slate-400 hover:text-slate-600 cursor-pointer">${icon("x", "w-5 h-5")}</button>
      </div>

      <form id="edit-product-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Product Title</label>
          <input type="text" id="edit-prod-name" value="${product.name}" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Sale Price (\u20B9)</label>
            <input type="number" id="edit-prod-price" value="${product.price}" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Stock Quantity</label>
            <input type="number" id="edit-prod-stock" value="${product.stock}" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" required />
          </div>
        </div>

        <!-- Product Image Management -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Product Image</label>
          <div class="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img id="edit-prod-preview-img" src="${currentImage}" alt="Product" class="max-w-full max-h-full object-contain" />
              </div>
              <div class="space-y-1.5 flex-1">
                <div class="text-[11px] font-bold text-slate-700" id="edit-image-status-label">Current Active Image</div>
                <input type="file" id="edit-prod-file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" />
                <div class="flex items-center gap-2">
                  <button type="button" id="edit-choose-file-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs">
                    ${icon("image", "w-3.5 h-3.5")}
                    <span>Choose Replacement Image</span>
                  </button>
                  <button type="button" id="edit-cancel-replace-btn" class="hidden text-xs text-slate-500 hover:text-red-600 font-medium cursor-pointer">
                    Cancel
                  </button>
                </div>
                <p class="text-[10px] text-slate-400">Accepted: JPG, JPEG, PNG, WEBP (Max 5 MB)</p>
              </div>
            </div>

            <!-- Optional URL input -->
            <div class="pt-2 border-t border-slate-200">
              <label class="block font-medium text-slate-600 text-[11px] mb-1">Or direct image URL</label>
              <input type="text" id="edit-prod-image" value="${product.images?.[0] || ""}" placeholder="/images/products/... or https://..." class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-hidden" />
            </div>

          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Short Specification Line</label>
          <input type="text" id="edit-prod-spec" value="${product.shortSpec || ""}" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-hidden" />
        </div>

        <!-- Upload Status Message Container -->
        <div id="edit-upload-status" class="hidden p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium flex items-center gap-2">
          <div class="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <span id="edit-upload-status-text">Uploading replacement to Cloudinary...</span>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" id="submit-edit-prod-btn" class="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs">
            Update Product
          </button>
          <button type="button" id="modal-cancel-btn" class="px-5 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;

  modalContainer.classList.remove("hidden");
  const close = () => modalContainer.classList.add("hidden");
  document.getElementById("close-modal-btn").onclick = close;
  document.getElementById("modal-cancel-btn").onclick = close;

  const fileInput = document.getElementById("edit-prod-file");
  const chooseBtn = document.getElementById("edit-choose-file-btn");
  const cancelBtn = document.getElementById("edit-cancel-replace-btn");
  const previewImg = document.getElementById("edit-prod-preview-img");
  const statusLabel = document.getElementById("edit-image-status-label");
  const urlInput = document.getElementById("edit-prod-image");
  const statusBox = document.getElementById("edit-upload-status");
  const statusText = document.getElementById("edit-upload-status-text");
  const submitBtn = document.getElementById("submit-edit-prod-btn");

  let selectedFile = null;

  chooseBtn.onclick = () => fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showToast("Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.", "error");
      fileInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size exceeds 5 MB limit. Please select a smaller image.", "error");
      fileInput.value = "";
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      statusLabel.textContent = `New Image: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
      cancelBtn.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  };

  cancelBtn.onclick = () => {
    selectedFile = null;
    fileInput.value = "";
    previewImg.src = currentImage;
    statusLabel.textContent = "Current Active Image";
    cancelBtn.classList.add("hidden");
  };

  const form = document.getElementById("edit-product-form");
  let isSubmitting = false;

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = document.getElementById("edit-prod-name").value.trim();
    const price = document.getElementById("edit-prod-price").value;
    const stock = document.getElementById("edit-prod-stock").value;
    const shortSpec = document.getElementById("edit-prod-spec").value.trim();
    let finalImageUrl = urlInput.value.trim() || currentImage;

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");

    if (selectedFile) {
      statusBox.classList.remove("hidden");
      statusText.textContent = "Uploading replacement to Cloudinary...";

      const formData = new FormData();
      formData.append("image", selectedFile);

      const uploadRes = await apiRequest("/admin/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadRes.success || !uploadRes.url) {
        statusBox.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        isSubmitting = false;
        showToast(`Image replacement failed: ${uploadRes.message || "Upload error"}. Product was not changed.`, "error");
        return;
      }

      finalImageUrl = uploadRes.url;
      statusText.textContent = "Updating product in MongoDB...";
    }

    const res = await apiRequest(`/admin/products/${product._id}`, {
      method: "PUT",
      body: JSON.stringify({
        name,
        price,
        stock,
        shortSpec,
        images: [finalImageUrl]
      })
    });

    statusBox.classList.add("hidden");
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    isSubmitting = false;

    if (res.success) {
      showToast("Product updated successfully with replacement image!", "success");
      close();
      renderAdminProducts().then((html) => {
        const app = document.getElementById("app-content");
        if (app) {
          app.innerHTML = html;
          attachAdminEvents("products");
        }
      });
    } else {
      showToast(res.message || "Update failed", "error");
    }
  };
}
