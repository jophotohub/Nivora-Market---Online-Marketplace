import { apiRequest } from "../services/api.js";
import { formatPrice } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { refreshCartCount, refreshWishlist } from "../services/state.js";
import { showToast } from "../components/Toast.js";
export async function renderWishlistPage() {
  const res = await apiRequest("/wishlist");
  const products = res.success ? res.products : [];
  if (products.length === 0) {
    return `
      <div class="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-xs">
          ${icon("heart", "w-10 h-10")}
        </div>
        <h1 class="text-2xl font-black text-slate-900">Your Wishlist is Empty</h1>
        <p class="text-slate-500 text-sm max-w-sm mx-auto">
          Save items that interest you by clicking the heart icon on any product card.
        </p>
        <div class="pt-2">
          <a href="/products" data-link class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">
            <span>Explore Products</span>
            ${icon("arrowRight", "w-4 h-4")}
          </a>
        </div>
      </div>
    `;
  }
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="pb-4 border-b border-slate-200">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">My Saved Wishlist</h1>
        <p class="text-xs text-slate-500">${products.length} saved products</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${products.map((product) => `
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-3.5 space-y-3">
            <div class="relative w-full aspect-square bg-slate-50 rounded-lg p-2 flex items-center justify-center">
              <a href="/products/${product._id}" data-link class="w-full h-full flex items-center justify-center">
                <img src="${getProductImage(product)}" alt="${product.name}" ${IMAGE_FALLBACK_ATTR} class="max-w-full max-h-full object-contain" />
              </a>
              <button class="remove-wishlist-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-slate-400 hover:text-red-500 flex items-center justify-center shadow-xs cursor-pointer" data-id="${product._id}" title="Remove">
                ${icon("trash", "w-4 h-4")}
              </button>
            </div>

            <div class="space-y-1.5 flex-1">
              <span class="text-[10px] font-bold text-orange-600 uppercase tracking-wider">${product.brand}</span>
              <a href="/products/${product._id}" data-link class="block text-xs font-bold text-slate-900 hover:text-orange-600 line-clamp-2 transition-colors">
                ${product.name}
              </a>
              <div class="flex items-baseline gap-2">
                <span class="text-base font-extrabold text-slate-900">${formatPrice(product.price)}</span>
                ${product.originalPrice > product.price ? `
                  <span class="text-xs text-slate-400 line-through">${formatPrice(product.originalPrice)}</span>
                ` : ""}
              </div>
            </div>

            <button
              class="move-to-cart-btn w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              data-id="${product._id}"
            >
              ${icon("cart", "w-3.5 h-3.5")}
              <span>Move to Cart</span>
            </button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}
export function attachWishlistPageEvents() {
  const reload = () => {
    renderWishlistPage().then((html) => {
      const app = document.getElementById("app-content");
      if (app) {
        app.innerHTML = html;
        attachWishlistPageEvents();
      }
    });
  };
  document.querySelectorAll(".remove-wishlist-btn").forEach((btn) => {
    btn.onclick = async () => {
      const productId = btn.getAttribute("data-id");
      if (!productId) return;
      const res = await apiRequest("/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        showToast("Removed from wishlist", "info");
        await refreshWishlist();
        reload();
      }
    };
  });
  document.querySelectorAll(".move-to-cart-btn").forEach((btn) => {
    btn.onclick = async () => {
      const productId = btn.getAttribute("data-id");
      if (!productId) return;
      const res = await apiRequest("/wishlist/move-to-cart", {
        method: "POST",
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        showToast("Moved to your cart", "success");
        await refreshWishlist();
        await refreshCartCount();
        reload();
      }
    };
  });
}
