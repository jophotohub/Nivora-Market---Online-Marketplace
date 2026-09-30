import { apiRequest, setToken } from "../services/api.js";
import { setUser, initAppState } from "../services/state.js";
import { icon } from "../utils/icons.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router.js";
export function renderLoginPage() {
  return `
    <div class="max-w-md mx-auto px-4 py-12 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center font-black text-2xl text-white mx-auto shadow-sm">
          N
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Sign In to Nivora Market</h1>
        <p class="text-xs text-slate-500">Access your orders, track shipments, and saved contractor supplies</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              id="login-email"
              placeholder="e.g. customer@nivoramarket.com"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-700">Password</label>
              <a href="/forgot-password" data-link class="text-[11px] text-orange-600 font-bold hover:underline">Forgot?</a>
            </div>
            <input
              type="password"
              id="login-password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            class="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <!-- Quick Demo Account Switcher -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div class="text-left">
            <span class="text-xs font-bold text-slate-900 block">Quick Demo Account Switcher</span>
            <span class="text-[11px] text-slate-500">Click below to instantly pre-fill and login as a Customer or Administrator.</span>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              id="demo-customer-login-btn"
              class="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              ${icon("user", "w-3.5 h-3.5 text-orange-600")}
              <span>Login as Customer</span>
            </button>
            <button
              type="button"
              id="demo-admin-login-btn"
              class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              ${icon("shield", "w-3.5 h-3.5 text-orange-500")}
              <span>Login as Admin</span>
            </button>
          </div>
        </div>

        <div class="text-center pt-2 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
          <div>
            Don't have an account yet?
            <a href="/register" data-link class="font-bold text-orange-600 hover:underline ml-1">Create Account</a>
          </div>
          <div class="pt-1">
            <a href="/admin/login" data-link class="text-slate-400 hover:text-slate-700 font-medium inline-flex items-center gap-1 transition-colors">
              ${icon("shield", "w-3.5 h-3.5")}
              <span>Admin Login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
export function attachLoginEvents() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const submitBtn = document.getElementById("login-submit-btn");

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = "Authenticating...";
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await initAppState();
        showToast(`Welcome back, ${res.user.name}!`, "success");
        navigate("/");
      } else {
        showToast(res.message || "Authentication failed", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In";
      }
    };
  }

  const demoCustBtn = document.getElementById("demo-customer-login-btn");
  if (demoCustBtn) {
    demoCustBtn.onclick = async () => {
      demoCustBtn.disabled = true;
      demoCustBtn.textContent = "Logging in...";
      try {
        const res = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: "demo.customer@nivoramarket.com",
            password: "Demo@12345"
          })
        });
        if (res.success && res.token && res.user) {
          setToken(res.token);
          setUser(res.user);
          await initAppState();
          showToast(`Welcome back, ${res.user.name}!`, "success");
          navigate("/");
        } else {
          showToast("Demo account is unavailable. Please check the demo account setup.", "error");
          demoCustBtn.disabled = false;
          demoCustBtn.innerHTML = `${icon("user", "w-3.5 h-3.5 text-orange-600")}<span>Login as Customer</span>`;
        }
      } catch (err) {
        showToast("Demo account is unavailable. Please check the demo account setup.", "error");
        demoCustBtn.disabled = false;
        demoCustBtn.innerHTML = `${icon("user", "w-3.5 h-3.5 text-orange-600")}<span>Login as Customer</span>`;
      }
    };
  }

  const demoAdminBtn = document.getElementById("demo-admin-login-btn");
  if (demoAdminBtn) {
    demoAdminBtn.onclick = async () => {
      demoAdminBtn.disabled = true;
      demoAdminBtn.textContent = "Logging in...";
      try {
        const res = await apiRequest("/auth/admin-login", {
          method: "POST",
          body: JSON.stringify({
            email: "demo.admin@nivoramarket.com",
            password: "Demo@12345"
          })
        });
        if (res.success && res.token && res.user && res.user.role === "admin") {
          setToken(res.token);
          setUser(res.user);
          await initAppState();
          showToast("Administrator authorized successfully.", "success");
          navigate("/admin/dashboard");
        } else {
          showToast("Demo account is unavailable. Please check the demo account setup.", "error");
          demoAdminBtn.disabled = false;
          demoAdminBtn.innerHTML = `${icon("shield", "w-3.5 h-3.5 text-orange-500")}<span>Login as Admin</span>`;
        }
      } catch (err) {
        showToast("Demo account is unavailable. Please check the demo account setup.", "error");
        demoAdminBtn.disabled = false;
        demoAdminBtn.innerHTML = `${icon("shield", "w-3.5 h-3.5 text-orange-500")}<span>Login as Admin</span>`;
      }
    };
  }
}
export function renderRegisterPage() {
  return `
    <div class="max-w-md mx-auto px-4 py-12 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center font-black text-2xl text-white mx-auto shadow-sm">
          N
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Create Nivora Account</h1>
        <p class="text-xs text-slate-500">Join thousands of contractors, technicians, and smart shoppers</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <form id="register-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              id="reg-name"
              placeholder="e.g. Vikram Sharma"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              id="reg-email"
              placeholder="e.g. vikram@example.com"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
            <input
              type="tel"
              id="reg-phone"
              placeholder="+91 98765 43210"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-orange-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              id="reg-password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
              minlength="6"
            />
          </div>

          <button
            type="submit"
            id="reg-submit-btn"
            class="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Create My Account
          </button>
        </form>

        <div class="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?
          <a href="/login" data-link class="font-bold text-orange-600 hover:underline ml-1">Sign In</a>
        </div>
      </div>
    </div>
  `;
}
export function attachRegisterEvents() {
  const form = document.getElementById("register-form");
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const phoneInput = document.getElementById("reg-phone");
  const passwordInput = document.getElementById("reg-password");
  const submitBtn = document.getElementById("reg-submit-btn");
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const password = passwordInput.value;
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password })
      });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await initAppState();
        showToast("Welcome to Nivora Market! Account created successfully.", "success");
        navigate("/");
      } else {
        showToast(res.message || "Registration failed", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Create My Account";
      }
    };
  }
}
export function renderForgotPasswordPage() {
  return `
    <div class="max-w-md mx-auto px-4 py-12 space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
        <p class="text-xs text-slate-500">Enter your registered email address to receive password reset instructions</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <form id="forgot-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input type="email" id="forgot-email" placeholder="customer@nivoramarket.com" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden" required />
          </div>

          <button type="submit" class="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
            Send Reset Instructions
          </button>
        </form>

        <div class="text-center pt-2 border-t border-slate-100 text-xs">
          <a href="/login" data-link class="text-orange-600 font-bold hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  `;
}
export function attachForgotPasswordEvents() {
  const form = document.getElementById("forgot-form");
  const emailInput = document.getElementById("forgot-email");
  if (form && emailInput) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const res = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: emailInput.value.trim() })
      });
      showToast(res.message, "success");
    };
  }
}
