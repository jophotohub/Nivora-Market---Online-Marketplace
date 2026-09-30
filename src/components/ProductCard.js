import { formatPrice } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { isWishlisted, refreshCartCount, refreshWishlist } from "../services/state.js";
import { apiRequest } from "../services/api.js";
import { showToast } from "./Toast.js";
export function renderProductCard(product) {
  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const mainImage = getProductImage(product);
  return `
    <div class="product-card group relative bg-white border border-slate-200 hover:border-orange-300 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between" data-product-id="${product._id}">
      <!-- Top Badges & Wishlist Button -->
      <div class="relative w-full aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
        ${product.discount > 0 ? `
          <span class="absolute top-2.5 left-2.5 z-10 bg-orange-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-xs">
            ${product.discount}% OFF
          </span>
        ` : ""}

        ${product.isDeal ? `
          <span class="absolute top-2.5 ${product.discount > 0 ? "left-20" : "left-2.5"} z-10 bg-slate-900 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
            DEAL
          </span>
        ` : ""}

        <!-- Wishlist Heart Button -->
        <button
          class="wishlist-toggle-btn absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-red-500 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
          data-id="${product._id}"
          title="Save to Wishlist"
          aria-label="Wishlist"
        >
          ${wishlisted ? icon("heartFilled", "w-4 h-4 text-red-500 animate-heart-pulse") : icon("heart", "w-4 h-4")}
        </button>

        <!-- Product Image Link -->
        <a href="/products/${product._id}" data-link class="w-full h-full flex items-center justify-center">
          <img
            src="${mainImage}"
            alt="${product.name}"
            loading="lazy"
            ${IMAGE_FALLBACK_ATTR}
            class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </a>
      </div>

      <!-- Product Information -->
      <div class="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <!-- Category & Brand -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span class="font-bold text-orange-600 uppercase tracking-wide truncate max-w-[120px]">${product.brand}</span>
            <span class="text-slate-400 font-medium">${product.category}</span>
          </div>

          <!-- Title -->
          <a href="/products/${product._id}" data-link class="block font-bold text-slate-900 text-sm hover:text-orange-600 line-clamp-2 transition-colors leading-snug">
            ${product.name}
          </a>

          <!-- Rating -->
          <div class="flex items-center gap-1.5 mt-1.5">
            <div class="flex items-center gap-0.5 bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>${product.rating}</span>
              ${icon("star", "w-3 h-3")}
            </div>
            <span class="text-xs text-slate-500">(${product.reviewCount || 0})</span>
          </div>
        </div>

        <!-- Price Section -->
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-extrabold text-slate-900">${formatPrice(product.price)}</span>
            ${product.originalPrice > product.price ? `
              <span class="text-xs text-slate-400 line-through">${formatPrice(product.originalPrice)}</span>
            ` : ""}
          </div>

          <!-- Stock / Delivery Status -->
          <div class="text-[11px] mt-0.5">
            ${outOfStock ? `
              <span class="text-red-600 font-bold">Out of Stock</span>
            ` : isLowStock ? `
              <span class="text-amber-600 font-bold">Only ${product.stock} left in stock</span>
            ` : `
              <span class="text-emerald-700 font-medium">Free Delivery by tomorrow</span>
            `}
          </div>

          <!-- Add to Cart CTA -->
          <button
            class="add-to-cart-btn w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${outOfStock ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 text-white hover:shadow-xs"}"
            data-id="${product._id}"
            ${outOfStock ? "disabled" : ""}
          >
            ${icon("cart", "w-4 h-4")}
            <span>${outOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
export function attachProductCardListeners(rootElement = document.body) {
  rootElement.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      const productId = target.getAttribute("data-id");
      if (!productId) return;
      target.disabled = true;
      const originalText = target.innerHTML;
      target.innerHTML = `<span>Adding...</span>`;
      const res = await apiRequest("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.success) {
        showToast(res.message || "Item added to cart!", "success");
        await refreshCartCount();
        target.innerHTML = `${icon("check", "w-4 h-4 text-white")} <span>Added!</span>`;
        setTimeout(() => {
          target.innerHTML = originalText;
          target.disabled = false;
        }, 1200);
      } else {
        showToast(res.message || "Failed to add item", "error");
        target.innerHTML = originalText;
        target.disabled = false;
      }
    };
  });
  rootElement.querySelectorAll(".wishlist-toggle-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      const productId = target.getAttribute("data-id");
      if (!productId) return;
      const res = await apiRequest("/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        showToast(res.message, "info");
        await refreshWishlist();
        if (res.isAdded) {
          target.innerHTML = icon("heartFilled", "w-4 h-4 text-red-500 animate-heart-pulse");
        } else {
          target.innerHTML = icon("heart", "w-4 h-4 text-slate-600");
        }
      } else {
        showToast(res.message || "Could not update wishlist", "error");
      }
    };
  });
}
