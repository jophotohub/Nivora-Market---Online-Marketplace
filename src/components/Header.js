import { getState, setUser } from "../services/state.js";
import { removeToken, apiRequest } from "../services/api.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { navigate } from "../router.js";
let searchDebounceTimeout = null;
export function renderHeader() {
  const { user, cartCount, wishlistIds, unreadNotifs } = getState();
  const wishlistCount = wishlistIds.size;
  return `
    <header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <!-- Main Header Bar -->
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-8">
        
        <!-- Mobile Menu Toggle Button -->
        <button id="mobile-menu-btn" class="md:hidden p-2 text-slate-700 hover:text-orange-600 focus:outline-hidden" aria-label="Toggle navigation">
          ${icon("menu", "w-6 h-6")}
        </button>

        <!-- Nivora Market Brand Logo -->
        <a href="/" data-link class="flex items-center gap-2.5 flex-shrink-0 group">
          <div class="w-10 h-10 bg-orange-600 group-hover:bg-orange-700 transition-colors rounded-lg flex items-center justify-center text-white font-extrabold text-2xl shadow-sm tracking-tight">
            N
          </div>
          <div class="flex flex-col leading-none">
            <span class="text-2xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
              Nivora
            </span>
            <span class="text-[10px] font-bold tracking-widest text-orange-600 uppercase">
              MARKET
            </span>
          </div>
        </a>

        <!-- Central Search Bar with Categories Dropdown and Autocomplete -->
        <div class="hidden md:flex flex-1 max-w-2xl relative">
          <form id="global-search-form" class="w-full flex items-stretch rounded-lg border-2 border-slate-300 focus-within:border-orange-500 transition-all bg-slate-50 overflow-hidden shadow-xs">
            <select id="search-category-select" class="bg-slate-100 border-r border-slate-300 text-xs font-semibold text-slate-700 px-3 py-2 outline-hidden cursor-pointer hover:bg-slate-200">
              <option value="all">All Categories</option>
              <option value="tools">Tools</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="electronics">Electronics</option>
              <option value="mobiles">Mobiles</option>
              <option value="home-appliances">Appliances</option>
            </select>
            <input
              id="global-search-input"
              type="text"
              placeholder="Search for Products, Brands and More"
              autocomplete="off"
              class="w-full bg-transparent px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-hidden font-normal"
            />
            <button
              type="submit"
              class="bg-orange-600 hover:bg-orange-700 text-white px-5 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Search"
            >
              ${icon("search", "w-5 h-5")}
            </button>
          </form>

          <!-- Autocomplete Suggestions Dropdown -->
          <div id="search-suggestions-dropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 hidden overflow-hidden">
            <div id="search-suggestions-content" class="py-2 divide-y divide-slate-100"></div>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          
          <!-- Wishlist Link -->
          <a href="/wishlist" data-link class="relative p-2 text-slate-700 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5" title="Wishlist">
            ${icon("heart", "w-6 h-6")}
            <span class="hidden lg:inline text-xs font-semibold">Wishlist</span>
            ${wishlistCount > 0 ? `
              <span class="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                ${wishlistCount}
              </span>
            ` : ""}
          </a>

          <!-- Cart Link -->
          <a href="/cart" data-link class="relative p-2 text-slate-700 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 group" title="Cart">
            <div class="relative">
              ${icon("cart", "w-6 h-6 group-hover:scale-105 transition-transform")}
              <span id="cart-counter-badge" class="${cartCount > 0 ? "scale-100" : "scale-0"} transition-transform absolute -top-1.5 -right-2 bg-orange-600 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs font-bold shadow-xs">
                ${cartCount}
              </span>
            </div>
            <span class="hidden sm:inline text-xs font-semibold">Cart</span>
          </a>

          <!-- User Account Dropdown -->
          <div class="relative" id="account-dropdown-wrapper">
            ${user ? `
              <button id="account-menu-trigger" class="flex items-center gap-2 px-3 py-1.5 text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 text-sm font-semibold transition-colors cursor-pointer">
                <div class="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                  ${user.name.charAt(0).toUpperCase()}
                </div>
                <span class="hidden sm:inline max-w-[100px] truncate">${user.name.split(" ")[0]}</span>
                ${icon("chevronDown", "w-3.5 h-3.5 text-slate-500")}
              </button>
              
              <div id="account-menu-dropdown" class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 hidden z-50">
                <div class="px-4 py-2 border-b border-slate-100">
                  <div class="font-bold text-slate-900 text-sm truncate">${user.name}</div>
                  <div class="text-xs text-slate-500 truncate">${user.email}</div>
                  ${user.role === "admin" ? '<span class="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-800 font-bold text-[10px] rounded">Admin Officer</span>' : ""}
                </div>
                
                <div class="py-1">
                  <a href="/profile" data-link class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    ${icon("user", "w-4 h-4")} My Profile
                  </a>
                  <a href="/orders" data-link class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    ${icon("package", "w-4 h-4")} My Orders
                  </a>
                  <a href="/wishlist" data-link class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    ${icon("heart", "w-4 h-4")} My Wishlist
                  </a>
                  <a href="/notifications" data-link class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    ${icon("bell", "w-4 h-4")} Notifications
                  </a>
                  ${user.role === "admin" ? `
                    <div class="my-1 border-t border-slate-100"></div>
                    <a href="/admin" data-link class="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                      ${icon("shield", "w-4 h-4")} Admin Portal
                    </a>
                  ` : ""}
                </div>

                <div class="pt-1 border-t border-slate-100">
                  <button id="logout-btn" class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-medium transition-colors cursor-pointer">
                    ${icon("arrowRight", "w-4 h-4")} Sign Out
                  </button>
                </div>
              </div>
            ` : `
              <a href="/login" data-link class="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors">
                ${icon("user", "w-4 h-4")}
                <span>Login</span>
              </a>
            `}
          </div>

        </div>
      </div>

      <!-- Mobile Search Row -->
      <div class="md:hidden px-4 pb-3">
        <form id="mobile-search-form" class="w-full flex items-stretch rounded-lg border border-slate-300 bg-slate-50 overflow-hidden">
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search for Products, Brands and More"
            class="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-hidden"
          />
          <button type="submit" class="bg-orange-600 text-white px-3 flex items-center justify-center" aria-label="Search">
            ${icon("search", "w-4 h-4")}
          </button>
        </form>
      </div>

      <!-- Mobile Drawer Menu Backdrop and Panel -->
      <div id="mobile-drawer-overlay" class="fixed inset-0 bg-black/50 z-50 hidden transition-opacity"></div>
      <div id="mobile-drawer" class="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl transform -translate-x-full transition-transform duration-300 flex flex-col">
        <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center font-bold text-white text-lg">N</div>
            <span class="font-black text-lg">Nivora Market</span>
          </div>
          <button id="close-drawer-btn" class="text-slate-300 hover:text-white" aria-label="Close menu">
            ${icon("x", "w-6 h-6")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto py-3 px-4 divide-y divide-slate-100">
          <div class="py-2 space-y-1">
            <a href="/" data-link class="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-600">Home</a>
            <a href="/products" data-link class="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-600">All Products</a>
            <a href="/orders" data-link class="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-600">My Orders</a>
            <a href="/wishlist" data-link class="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-600">Wishlist</a>
            <a href="/notifications" data-link class="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-600">Notifications</a>
          </div>

          <div class="py-3">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Top Categories</div>
            <a href="/category/tools" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Tools & Hardware</a>
            <a href="/category/electrical" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Electrical Supplies</a>
            <a href="/category/plumbing" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Plumbing & Fixtures</a>
            <a href="/category/electronics" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Consumer Electronics</a>
            <a href="/category/mobiles" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Mobiles & Tablets</a>
            <a href="/category/home-appliances" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Home Appliances</a>
          </div>

          ${user?.role === "admin" ? `
            <div class="py-3">
              <div class="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 px-3">Administration</div>
              <a href="/admin" data-link class="block px-3 py-1.5 text-sm font-bold text-slate-800 hover:text-orange-600">Admin Dashboard</a>
              <a href="/admin/products" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Manage Products</a>
              <a href="/admin/orders" data-link class="block px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600">Manage Orders</a>
            </div>
          ` : ""}
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          ${user ? `
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-sm text-slate-900">${user.name}</div>
                <div class="text-xs text-slate-500">${user.email}</div>
              </div>
              <button id="mobile-logout-btn" class="text-xs font-bold text-red-600 hover:underline">Logout</button>
            </div>
          ` : `
            <a href="/login" data-link class="block w-full text-center py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm">
              Sign In / Register
            </a>
          `}
        </div>
      </div>
    </header>
  `;
}
export function attachHeaderEvents() {
  const accountTrigger = document.getElementById("account-menu-trigger");
  const accountDropdown = document.getElementById("account-menu-dropdown");
  if (accountTrigger && accountDropdown) {
    accountTrigger.onclick = (e) => {
      e.stopPropagation();
      accountDropdown.classList.toggle("hidden");
    };
    document.addEventListener("click", (e) => {
      if (!accountDropdown.contains(e.target) && e.target !== accountTrigger) {
        accountDropdown.classList.add("hidden");
      }
    });
  }
  const handleLogout = () => {
    removeToken();
    setUser(null);
    navigate("/");
  };
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.onclick = handleLogout;
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");
  if (mobileLogoutBtn) mobileLogoutBtn.onclick = handleLogout;
  const searchForm = document.getElementById("global-search-form");
  const searchInput = document.getElementById("global-search-input");
  const categorySelect = document.getElementById("search-category-select");
  const suggestionsDropdown = document.getElementById("search-suggestions-dropdown");
  const suggestionsContent = document.getElementById("search-suggestions-content");
  const executeSearch = (q, cat) => {
    if (suggestionsDropdown) suggestionsDropdown.classList.add("hidden");
    let url = `/products?search=${encodeURIComponent(q.trim())}`;
    if (cat && cat !== "all") {
      url += `&category=${encodeURIComponent(cat)}`;
    }
    navigate(url);
  };
  if (searchForm && searchInput) {
    searchForm.onsubmit = (e) => {
      e.preventDefault();
      executeSearch(searchInput.value, categorySelect?.value);
    };
    searchInput.oninput = () => {
      const q = searchInput.value.trim();
      clearTimeout(searchDebounceTimeout);
      if (q.length < 2) {
        if (suggestionsDropdown) suggestionsDropdown.classList.add("hidden");
        return;
      }
      searchDebounceTimeout = setTimeout(async () => {
        const res = await apiRequest(`/products/search-suggestions?q=${encodeURIComponent(q)}`);
        if (res.success && suggestionsContent && suggestionsDropdown) {
          const { suggestions = [], categories = [] } = res;
          if (suggestions.length === 0 && categories.length === 0) {
            suggestionsDropdown.classList.add("hidden");
            return;
          }
          let html = "";
          if (categories.length > 0) {
            html += `<div class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Categories</div>`;
            categories.forEach((c) => {
              html += `
                <a href="/category/${c.slug}" data-link class="block px-4 py-2 hover:bg-orange-50 text-xs font-semibold text-slate-800 hover:text-orange-600 transition-colors">
                  In <span class="text-orange-600 font-bold">${c.name}</span>
                </a>
              `;
            });
          }
          if (suggestions.length > 0) {
            html += `<div class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Products</div>`;
            suggestions.forEach((p) => {
              html += `
                <a href="/products/${p.id}" data-link class="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors">
                  <img src="${getProductImage(p.image)}" alt="${p.name}" ${IMAGE_FALLBACK_ATTR} class="w-9 h-9 object-contain rounded bg-slate-100 p-0.5" />
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-slate-900 truncate">${p.name}</div>
                    <div class="text-[11px] text-orange-600 font-bold">\u20B9${p.price.toLocaleString("en-IN")}</div>
                  </div>
                </a>
              `;
            });
          }
          suggestionsContent.innerHTML = html;
          suggestionsDropdown.classList.remove("hidden");
        }
      }, 250);
    };
    document.addEventListener("click", (e) => {
      if (suggestionsDropdown && !suggestionsDropdown.contains(e.target) && e.target !== searchInput) {
        suggestionsDropdown.classList.add("hidden");
      }
    });
  }
  const mobileSearchForm = document.getElementById("mobile-search-form");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  if (mobileSearchForm && mobileSearchInput) {
    mobileSearchForm.onsubmit = (e) => {
      e.preventDefault();
      executeSearch(mobileSearchInput.value);
    };
  }
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const closeDrawerBtn = document.getElementById("close-drawer-btn");
  const drawerOverlay = document.getElementById("mobile-drawer-overlay");
  const drawer = document.getElementById("mobile-drawer");
  const openDrawer = () => {
    drawerOverlay?.classList.remove("hidden");
    drawer?.classList.remove("-translate-x-full");
  };
  const closeDrawer = () => {
    drawerOverlay?.classList.add("hidden");
    drawer?.classList.add("-translate-x-full");
  };
  if (mobileMenuBtn) mobileMenuBtn.onclick = openDrawer;
  if (closeDrawerBtn) closeDrawerBtn.onclick = closeDrawer;
  if (drawerOverlay) drawerOverlay.onclick = closeDrawer;
}
