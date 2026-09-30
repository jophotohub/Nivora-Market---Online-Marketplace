import { apiRequest } from "../services/api.js";
import { renderProductCard, attachProductCardListeners } from "../components/ProductCard.js";
import { icon } from "../utils/icons.js";
import { navigate } from "../router.js";
export async function renderProductsPage(queryParams) {
  const search = queryParams.get("search") || "";
  const category = queryParams.get("category") || "all";
  const brand = queryParams.get("brand") || "all";
  const minPrice = queryParams.get("minPrice") || "";
  const maxPrice = queryParams.get("maxPrice") || "";
  const rating = queryParams.get("rating") || "";
  const inStock = queryParams.get("inStock") || "";
  const sort = queryParams.get("sort") || "newest";
  const page = queryParams.get("page") || "1";
  const queryString = queryParams.toString();
  const res = await apiRequest(`/products?${queryString}`);
  const categoriesRes = await apiRequest("/categories");
  const products = res.success ? res.products : [];
  const pagination = res.pagination || { page: 1, totalPages: 1, totalProducts: 0 };
  const categories = categoriesRes.success ? categoriesRes.categories : [];
  const brands = res.availableBrands || [];
  return `
    <div class="max-w-7xl mx-auto px-4 py-6">
      
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <a href="/" data-link class="hover:text-orange-600 transition-colors">Home</a>
        ${icon("chevronRight", "w-3 h-3 text-slate-400")}
        <span class="font-bold text-slate-800">
          ${category !== "all" ? category.charAt(0).toUpperCase() + category.slice(1) : search ? `Search: "${search}"` : "All Products"}
        </span>
      </nav>

      <!-- Page Header with Result Count & Sort Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            ${category !== "all" ? `${category.toUpperCase()} CATALOG` : search ? `Search Results for "${search}"` : "Products Catalog"}
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Showing <span class="font-bold text-slate-800">${products.length}</span> of <span class="font-bold text-slate-800">${pagination.totalProducts}</span> items
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Mobile Filter Drawer Trigger -->
          <button id="open-filter-drawer-btn" class="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white shadow-2xs">
            ${icon("filter", "w-4 h-4 text-orange-600")}
            <span>Filters</span>
          </button>

          <!-- Sort Select -->
          <div class="flex items-center gap-2">
            <label for="catalog-sort-select" class="text-xs font-bold text-slate-600 hidden sm:inline">Sort by:</label>
            <select id="catalog-sort-select" class="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-3 py-2 outline-hidden cursor-pointer hover:border-orange-500 shadow-2xs">
              <option value="newest" ${sort === "newest" ? "selected" : ""}>Newest Arrivals</option>
              <option value="price_asc" ${sort === "price_asc" ? "selected" : ""}>Price: Low to High</option>
              <option value="price_desc" ${sort === "price_desc" ? "selected" : ""}>Price: High to Low</option>
              <option value="rating" ${sort === "rating" ? "selected" : ""}>Highest Rated</option>
              <option value="discount" ${sort === "discount" ? "selected" : ""}>Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Layout: Sidebar Filters + Products Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- SIDEBAR FILTERS (Desktop) -->
        <aside id="filters-sidebar" class="hidden lg:block space-y-6">
          <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <span class="font-bold text-slate-900 text-sm">Filters</span>
              <a href="/products" data-link class="text-xs text-orange-600 font-bold hover:underline">Clear All</a>
            </div>

            <!-- Categories Filter -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Category</h3>
              <div class="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-orange-600">
                  <input type="radio" name="filter-category" value="all" ${category === "all" ? "checked" : ""} class="text-orange-600 focus:ring-orange-500" />
                  <span>All Categories</span>
                </label>
                ${categories.map((cat) => `
                  <label class="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer hover:text-orange-600">
                    <div class="flex items-center gap-2">
                      <input type="radio" name="filter-category" value="${cat.slug}" ${category === cat.slug ? "checked" : ""} class="text-orange-600 focus:ring-orange-500" />
                      <span>${cat.name}</span>
                    </div>
                    <span class="text-[11px] text-slate-400">(${cat.productCount})</span>
                  </label>
                `).join("")}
              </div>
            </div>

            <!-- Price Range Filter -->
            <div class="border-t border-slate-100 pt-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Price Range</h3>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  id="filter-min-price"
                  placeholder="Min \u20B9"
                  value="${minPrice}"
                  class="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden"
                />
                <span class="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  id="filter-max-price"
                  placeholder="Max \u20B9"
                  value="${maxPrice}"
                  class="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden"
                />
              </div>
              <button id="apply-price-btn" class="w-full mt-2 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded text-xs font-bold transition-colors cursor-pointer">
                Apply Price
              </button>
            </div>

            <!-- Customer Rating Filter -->
            <div class="border-t border-slate-100 pt-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Rating</h3>
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-orange-600">
                  <input type="radio" name="filter-rating" value="4" ${rating === "4" ? "checked" : ""} />
                  <span class="flex items-center gap-1 text-emerald-700 font-bold">4.0 \u2605 & above</span>
                </label>
                <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-orange-600">
                  <input type="radio" name="filter-rating" value="3" ${rating === "3" ? "checked" : ""} />
                  <span class="flex items-center gap-1 text-slate-700">3.0 \u2605 & above</span>
                </label>
              </div>
            </div>

            <!-- Availability Filter -->
            <div class="border-t border-slate-100 pt-4">
              <label class="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" id="filter-instock" ${inStock === "true" ? "checked" : ""} class="rounded text-orange-600 focus:ring-orange-500" />
                <span>Exclude Out of Stock</span>
              </label>
            </div>

            <!-- Brands Filter -->
            ${brands.length > 0 ? `
              <div class="border-t border-slate-100 pt-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Brand</h3>
                <div class="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-orange-600">
                    <input type="radio" name="filter-brand" value="all" ${brand === "all" ? "checked" : ""} />
                    <span>All Brands</span>
                  </label>
                  ${brands.map((b) => `
                    <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-orange-600">
                      <input type="radio" name="filter-brand" value="${b.toLowerCase()}" ${brand.toLowerCase() === b.toLowerCase() ? "checked" : ""} />
                      <span>${b}</span>
                    </label>
                  `).join("")}
                </div>
              </div>
            ` : ""}

          </div>
        </aside>

        <!-- PRODUCTS GRID & PAGINATION -->
        <main class="lg:col-span-3 space-y-8">
          ${products.length === 0 ? `
            <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
              <div class="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                ${icon("search", "w-8 h-8")}
              </div>
              <h2 class="text-xl font-bold text-slate-900">No matching products found</h2>
              <p class="text-sm text-slate-500 max-w-md mx-auto">
                Try loosening your filters, checking for spelling errors, or browsing our primary categories.
              </p>
              <div class="pt-2">
                <a href="/products" data-link class="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors">
                  Reset All Filters
                </a>
              </div>
            </div>
          ` : `
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
              ${products.map((p) => renderProductCard(p)).join("")}
            </div>

            <!-- Pagination Bar -->
            ${pagination.totalPages > 1 ? `
              <div class="flex items-center justify-center gap-2 pt-6">
                ${pagination.page > 1 ? `
                  <button id="prev-page-btn" class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Previous
                  </button>
                ` : ""}

                <div class="flex items-center gap-1">
                  ${Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => `
                    <button class="pagination-page-btn w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pNum === pagination.page ? "bg-orange-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-100 border border-slate-200"}" data-page="${pNum}">
                      ${pNum}
                    </button>
                  `).join("")}
                </div>

                ${pagination.page < pagination.totalPages ? `
                  <button id="next-page-btn" class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Next
                  </button>
                ` : ""}
              </div>
            ` : ""}
          `}
        </main>

      </div>
    </div>
  `;
}
export function attachProductsPageEvents(currentParams) {
  attachProductCardListeners();
  const updateFilters = (key, val) => {
    const params = new URLSearchParams(currentParams);
    if (!val || val === "all") {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    params.delete("page");
    navigate(`/products?${params.toString()}`);
  };
  const sortSelect = document.getElementById("catalog-sort-select");
  if (sortSelect) {
    sortSelect.onchange = () => {
      updateFilters("sort", sortSelect.value);
    };
  }
  document.querySelectorAll('input[name="filter-category"]').forEach((radio) => {
    radio.onchange = (e) => {
      const val = e.target.value;
      updateFilters("category", val);
    };
  });
  document.querySelectorAll('input[name="filter-rating"]').forEach((radio) => {
    radio.onchange = (e) => {
      const val = e.target.value;
      updateFilters("rating", val);
    };
  });
  document.querySelectorAll('input[name="filter-brand"]').forEach((radio) => {
    radio.onchange = (e) => {
      const val = e.target.value;
      updateFilters("brand", val);
    };
  });
  const inStockCheck = document.getElementById("filter-instock");
  if (inStockCheck) {
    inStockCheck.onchange = () => {
      updateFilters("inStock", inStockCheck.checked ? "true" : "");
    };
  }
  const applyPriceBtn = document.getElementById("apply-price-btn");
  const minPriceInput = document.getElementById("filter-min-price");
  const maxPriceInput = document.getElementById("filter-max-price");
  if (applyPriceBtn && minPriceInput && maxPriceInput) {
    applyPriceBtn.onclick = () => {
      const params = new URLSearchParams(currentParams);
      if (minPriceInput.value) params.set("minPrice", minPriceInput.value);
      else params.delete("minPrice");
      if (maxPriceInput.value) params.set("maxPrice", maxPriceInput.value);
      else params.delete("maxPrice");
      params.delete("page");
      navigate(`/products?${params.toString()}`);
    };
  }
  document.querySelectorAll(".pagination-page-btn").forEach((btn) => {
    btn.onclick = () => {
      const targetPage = btn.getAttribute("data-page");
      if (targetPage) {
        const params = new URLSearchParams(currentParams);
        params.set("page", targetPage);
        navigate(`/products?${params.toString()}`);
      }
    };
  });
  const prevBtn = document.getElementById("prev-page-btn");
  if (prevBtn) {
    prevBtn.onclick = () => {
      const cur = parseInt(currentParams.get("page") || "1", 10);
      const params = new URLSearchParams(currentParams);
      params.set("page", String(cur - 1));
      navigate(`/products?${params.toString()}`);
    };
  }
  const nextBtn = document.getElementById("next-page-btn");
  if (nextBtn) {
    nextBtn.onclick = () => {
      const cur = parseInt(currentParams.get("page") || "1", 10);
      const params = new URLSearchParams(currentParams);
      params.set("page", String(cur + 1));
      navigate(`/products?${params.toString()}`);
    };
  }
}
