import { apiRequest } from "../services/api.js";
import { formatPrice } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { renderProductCard, attachProductCardListeners } from "../components/ProductCard.js";
import { isWishlisted, refreshCartCount, refreshWishlist } from "../services/state.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router.js";
let selectedVariant = void 0;
let selectedQuantity = 1;
export async function renderProductDetailPage(productId) {
  const res = await apiRequest(`/products/${productId}`);
  if (!res.success || !res.product) {
    return `
      <div class="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 class="text-2xl font-black text-slate-900">Product Not Found</h1>
        <p class="text-slate-500">The product you are looking for may have been removed or is temporarily unavailable.</p>
        <a href="/products" data-link class="inline-block px-6 py-2.5 bg-orange-600 text-white rounded-lg font-bold text-sm">
          Return to Marketplace
        </a>
      </div>
    `;
  }
  const product = res.product;
  const related = res.related || [];
  const reviews = res.reviews || [];
  try {
    const recents = JSON.parse(localStorage.getItem("nivora_recent_views") || "[]");
    const filtered = recents.filter((id) => id !== product._id);
    filtered.unshift(product._id);
    localStorage.setItem("nivora_recent_views", JSON.stringify(filtered.slice(0, 10)));
  } catch (e) {
  }
  const outOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const wishlisted = isWishlisted(product._id);
  selectedVariant = product.variants?.[0]?.options[0];
  selectedQuantity = 1;
  return `
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-slate-500">
        <a href="/" data-link class="hover:text-orange-600 transition-colors">Home</a>
        ${icon("chevronRight", "w-3 h-3 text-slate-400")}
        <a href="/category/${product.categorySlug}" data-link class="hover:text-orange-600 transition-colors">${product.category}</a>
        ${icon("chevronRight", "w-3 h-3 text-slate-400")}
        <span class="font-bold text-slate-800 truncate max-w-sm">${product.name}</span>
      </nav>

      <!-- Main Product Details Container -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          <!-- LEFT: Image Gallery -->
          <div class="space-y-4">
            <div class="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-4">
              <img
                id="main-product-image"
                src="${getProductImage(product)}"
                alt="${product.name}"
                ${IMAGE_FALLBACK_ATTR}
                class="max-w-full max-h-full object-contain transition-all duration-300"
              />
              ${product.discount > 0 ? `
                <span class="absolute top-4 left-4 bg-orange-600 text-white text-xs font-black px-2.5 py-1 rounded shadow-xs">
                  ${product.discount}% OFF
                </span>
              ` : ""}
            </div>

            <!-- Thumbnail Selector -->
            ${product.images && product.images.length > 1 ? `
              <div class="flex items-center gap-3 overflow-x-auto pb-2">
                ${product.images.map((img, idx) => `
                  <button
                    class="thumb-image-btn w-16 h-16 rounded-lg border-2 p-1 bg-slate-50 flex items-center justify-center transition-all cursor-pointer ${idx === 0 ? "border-orange-600" : "border-slate-200 hover:border-slate-400"}"
                    data-img="${img}"
                  >
                    <img src="${img}" alt="${product.name}" ${IMAGE_FALLBACK_ATTR} class="max-w-full max-h-full object-contain" />
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>

          <!-- RIGHT: Product Info & Actions -->
          <div class="flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <!-- Brand & SKU -->
              <div class="flex items-center justify-between text-xs text-slate-500">
                <span class="font-black text-orange-600 tracking-wider uppercase">${product.brand}</span>
                <span class="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">SKU: ${product.sku}</span>
              </div>

              <!-- Title -->
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                ${product.name}
              </h1>

              <!-- Short Spec Pill -->
              ${product.shortSpec ? `
                <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                  ${product.shortSpec}
                </p>
              ` : ""}

              <!-- Rating & Reviews -->
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                  <span>${product.rating}</span>
                  ${icon("star", "w-3 h-3")}
                </div>
                <span class="text-xs font-bold text-slate-600">${product.reviewCount} Ratings & ${reviews.length} Reviews</span>
                <span class="text-slate-300">|</span>
                <span class="text-xs text-orange-600 font-bold flex items-center gap-1">
                  ${icon("check", "w-3.5 h-3.5")} Nivora Assured
                </span>
              </div>

              <!-- Price Box -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div class="flex items-baseline gap-3">
                  <span class="text-3xl font-black text-slate-900">${formatPrice(product.price)}</span>
                  ${product.originalPrice > product.price ? `
                    <span class="text-base text-slate-400 line-through">${formatPrice(product.originalPrice)}</span>
                    <span class="text-sm font-bold text-emerald-600">Save ${formatPrice(product.originalPrice - product.price)}</span>
                  ` : ""}
                </div>
                <div class="text-[11px] text-slate-500">Inclusive of all standard GST taxes</div>
              </div>

              <!-- Variants Selector -->
              ${product.variants && product.variants.length > 0 ? `
                <div class="space-y-3 pt-2">
                  ${product.variants.map((v) => `
                    <div>
                      <div class="text-xs font-bold text-slate-700 mb-1.5">${v.name}:</div>
                      <div class="flex flex-wrap gap-2">
                        ${v.options.map((opt, i) => `
                          <button
                            class="variant-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${i === 0 ? "border-orange-600 bg-orange-50 text-orange-600 font-bold" : "border-slate-300 text-slate-700 hover:border-slate-400"}"
                            data-variant="${opt}"
                          >
                            ${opt}
                          </button>
                        `).join("")}
                      </div>
                    </div>
                  `).join("")}
                </div>
              ` : ""}

              <!-- Stock Availability Status -->
              <div class="pt-2">
                ${outOfStock ? `
                  <div class="flex items-center gap-2 text-red-600 font-bold text-sm">
                    ${icon("info", "w-4 h-4")} Currently Out of Stock
                  </div>
                ` : isLowStock ? `
                  <div class="flex items-center gap-2 text-amber-600 font-bold text-sm">
                    ${icon("clock", "w-4 h-4")} Hurry, only ${product.stock} units left in stock!
                  </div>
                ` : `
                  <div class="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    ${icon("check", "w-4 h-4")} In Stock & Ready to Dispatch
                  </div>
                `}
              </div>

              <!-- Quantity Selector -->
              ${!outOfStock ? `
                <div class="flex items-center gap-4 pt-2">
                  <span class="text-xs font-bold text-slate-700">Quantity:</span>
                  <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                    <button id="qty-decrement" class="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                      ${icon("minus", "w-3.5 h-3.5")}
                    </button>
                    <span id="qty-display" class="px-4 py-1.5 text-xs font-bold text-slate-900 bg-white">1</span>
                    <button id="qty-increment" class="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                      ${icon("plus", "w-3.5 h-3.5")}
                    </button>
                  </div>
                </div>
              ` : ""}

              <!-- Delivery Pincode Checker -->
              <div class="pt-2">
                <div class="text-xs font-bold text-slate-700 mb-1">Check Delivery & Services</div>
                <div class="flex gap-2 max-w-xs">
                  <input
                    type="text"
                    id="pincode-input"
                    placeholder="Enter 6-digit Pincode"
                    maxlength="6"
                    class="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-hidden w-full focus:border-orange-500"
                  />
                  <button id="check-pincode-btn" class="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                    Check
                  </button>
                </div>
                <div id="pincode-result" class="text-xs mt-1.5 text-slate-600 hidden"></div>
              </div>
            </div>

            <!-- Action Buttons: Add to Cart, Buy Now, Wishlist -->
            <div class="pt-6 border-t border-slate-200 space-y-3">
              <div class="flex items-center gap-3">
                <button
                  id="detail-add-cart-btn"
                  class="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer ${outOfStock ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 text-white"}"
                  ${outOfStock ? "disabled" : ""}
                >
                  ${icon("cart", "w-5 h-5")}
                  <span>Add to Cart</span>
                </button>

                <button
                  id="detail-buy-now-btn"
                  class="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md active:scale-95 cursor-pointer ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}"
                  ${outOfStock ? "disabled" : ""}
                >
                  <span>Buy Now</span>
                </button>

                <button
                  id="detail-wishlist-btn"
                  class="w-12 h-12 rounded-xl border border-slate-300 hover:border-red-400 flex items-center justify-center transition-colors cursor-pointer text-slate-600 hover:text-red-500"
                  title="Save to Wishlist"
                >
                  ${wishlisted ? icon("heartFilled", "w-5 h-5 text-red-500 animate-heart-pulse") : icon("heart", "w-5 h-5")}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Description & Specifications Tabs -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
        <h2 class="text-lg font-black text-slate-900 pb-3 border-b border-slate-200">
          Product Details & Technical Specifications
        </h2>
        
        <div class="text-sm text-slate-700 leading-relaxed max-w-4xl">
          ${product.description}
        </div>

        ${product.specifications && Object.keys(product.specifications).length > 0 ? `
          <div class="pt-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Specifications</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
              ${Object.entries(product.specifications).map(([key, val]) => `
                <div class="flex items-center justify-between py-1.5 border-b border-slate-200 text-xs">
                  <span class="text-slate-500 font-medium">${key}</span>
                  <span class="font-bold text-slate-900">${val}</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}
      </div>

      <!-- Ratings & Customer Reviews Section -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-lg font-black text-slate-900">Customer Ratings & Reviews</h2>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                <span>${product.rating}</span>
                ${icon("star", "w-3 h-3")}
              </div>
              <span class="text-xs text-slate-500">Based on ${product.reviewCount} customer reviews</span>
            </div>
          </div>

          <button id="open-write-review-btn" class="px-4 py-2 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 rounded-lg text-xs font-bold transition-colors cursor-pointer">
            Write a Review
          </button>
        </div>

        <!-- Write Review Form Container (Toggleable) -->
        <div id="write-review-form-box" class="hidden bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Share Your Experience with this Product</h3>
          <form id="submit-review-form" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
              <select id="review-rating-select" class="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800">
                <option value="5">5 Stars - Outstanding</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Terrible</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Review Title</label>
              <input type="text" id="review-title-input" placeholder="Summarize your review" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Review Comments</label>
              <textarea id="review-comment-input" rows="3" placeholder="What did you like or dislike about this product?" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 outline-hidden" required></textarea>
            </div>
            <div class="flex items-center gap-2">
              <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                Submit Review
              </button>
              <button type="button" id="cancel-review-btn" class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Reviews List -->
        <div class="space-y-4 divide-y divide-slate-100">
          ${reviews.length === 0 ? `
            <p class="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review!</p>
          ` : reviews.map((r) => `
            <div class="pt-4 first:pt-0 space-y-1.5">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-0.5 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  <span>${r.rating}</span>
                  ${icon("star", "w-2.5 h-2.5")}
                </div>
                <span class="text-xs font-bold text-slate-900">${r.title || "Verified Purchase"}</span>
              </div>
              <p class="text-xs text-slate-700 leading-relaxed">${r.comment}</p>
              <div class="text-[10px] text-slate-400 font-medium">
                ${r.userName} \u2022 Verified Buyer
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Related Products Section -->
      ${related.length > 0 ? `
        <div class="space-y-4">
          <h2 class="text-xl font-black text-slate-900 pb-2 border-b border-slate-200">
            Similar Products You Might Need
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${related.map((p) => renderProductCard(p)).join("")}
          </div>
        </div>
      ` : ""}

    </div>
  `;
}
export function attachProductDetailPageEvents(productId) {
  attachProductCardListeners();
  const mainImg = document.getElementById("main-product-image");
  const thumbBtns = document.querySelectorAll(".thumb-image-btn");
  thumbBtns.forEach((btn) => {
    btn.onclick = () => {
      const src = btn.getAttribute("data-img");
      if (src && mainImg) {
        mainImg.src = src;
        thumbBtns.forEach((b) => b.classList.remove("border-orange-600"));
        btn.classList.add("border-orange-600");
      }
    };
  });
  document.querySelectorAll(".variant-btn").forEach((btn) => {
    btn.onclick = () => {
      selectedVariant = btn.getAttribute("data-variant") || void 0;
      document.querySelectorAll(".variant-btn").forEach((b) => {
        b.classList.remove("border-orange-600", "bg-orange-50", "text-orange-600", "font-bold");
        b.classList.add("border-slate-300", "text-slate-700");
      });
      btn.classList.add("border-orange-600", "bg-orange-50", "text-orange-600", "font-bold");
      btn.classList.remove("border-slate-300", "text-slate-700");
    };
  });
  const qtyDisplay = document.getElementById("qty-display");
  const incBtn = document.getElementById("qty-increment");
  const decBtn = document.getElementById("qty-decrement");
  if (incBtn && decBtn && qtyDisplay) {
    incBtn.onclick = () => {
      selectedQuantity += 1;
      qtyDisplay.textContent = String(selectedQuantity);
    };
    decBtn.onclick = () => {
      if (selectedQuantity > 1) {
        selectedQuantity -= 1;
        qtyDisplay.textContent = String(selectedQuantity);
      }
    };
  }
  const pincodeInput = document.getElementById("pincode-input");
  const checkPincodeBtn = document.getElementById("check-pincode-btn");
  const pincodeResult = document.getElementById("pincode-result");
  if (checkPincodeBtn && pincodeInput && pincodeResult) {
    checkPincodeBtn.onclick = () => {
      const code = pincodeInput.value.trim();
      if (code.length === 6 && /^\d+$/.test(code)) {
        pincodeResult.classList.remove("hidden");
        pincodeResult.innerHTML = `
          <span class="text-emerald-700 font-bold">\u2713 Delivery available for ${code}</span>
          <span class="block text-slate-500">Standard Delivery by Wednesday \u2022 Free Shipping</span>
        `;
      } else {
        pincodeResult.classList.remove("hidden");
        pincodeResult.innerHTML = `<span class="text-red-600 font-semibold">Please enter a valid 6-digit Indian PIN code</span>`;
      }
    };
  }
  const addCartBtn = document.getElementById("detail-add-cart-btn");
  if (addCartBtn) {
    addCartBtn.onclick = async () => {
      addCartBtn.disabled = true;
      const originalText = addCartBtn.innerHTML;
      addCartBtn.innerHTML = `<span>Adding...</span>`;
      const res = await apiRequest("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: selectedQuantity,
          variant: selectedVariant
        })
      });
      if (res.success) {
        showToast(res.message || "Added to cart!", "success");
        await refreshCartCount();
        addCartBtn.innerHTML = `${icon("check", "w-5 h-5 text-white")} <span>Added to Cart!</span>`;
        setTimeout(() => {
          addCartBtn.innerHTML = originalText;
          addCartBtn.disabled = false;
        }, 1200);
      } else {
        showToast(res.message || "Failed to add item", "error");
        addCartBtn.innerHTML = originalText;
        addCartBtn.disabled = false;
      }
    };
  }
  const buyNowBtn = document.getElementById("detail-buy-now-btn");
  if (buyNowBtn) {
    buyNowBtn.onclick = async () => {
      await apiRequest("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: selectedQuantity,
          variant: selectedVariant
        })
      });
      await refreshCartCount();
      navigate("/checkout");
    };
  }
  const wishlistBtn = document.getElementById("detail-wishlist-btn");
  if (wishlistBtn) {
    wishlistBtn.onclick = async () => {
      const res = await apiRequest("/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        showToast(res.message, "info");
        await refreshWishlist();
        if (res.isAdded) {
          wishlistBtn.innerHTML = icon("heartFilled", "w-5 h-5 text-red-500 animate-heart-pulse");
        } else {
          wishlistBtn.innerHTML = icon("heart", "w-5 h-5 text-slate-600");
        }
      }
    };
  }
  const openReviewBtn = document.getElementById("open-write-review-btn");
  const reviewBox = document.getElementById("write-review-form-box");
  const cancelReviewBtn = document.getElementById("cancel-review-btn");
  const submitReviewForm = document.getElementById("submit-review-form");
  if (openReviewBtn && reviewBox) {
    openReviewBtn.onclick = () => {
      reviewBox.classList.toggle("hidden");
    };
  }
  if (cancelReviewBtn && reviewBox) {
    cancelReviewBtn.onclick = () => {
      reviewBox.classList.add("hidden");
    };
  }
  if (submitReviewForm) {
    submitReviewForm.onsubmit = async (e) => {
      e.preventDefault();
      const rating = document.getElementById("review-rating-select").value;
      const title = document.getElementById("review-title-input").value;
      const comment = document.getElementById("review-comment-input").value;
      const res = await apiRequest(`/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, title, comment })
      });
      if (res.success) {
        showToast(res.message, "success");
        renderProductDetailPage(productId).then((html) => {
          const app = document.getElementById("app-content");
          if (app) {
            app.innerHTML = html;
            attachProductDetailPageEvents(productId);
          }
        });
      } else {
        showToast(res.message || "Could not submit review", "error");
      }
    };
  }
}
