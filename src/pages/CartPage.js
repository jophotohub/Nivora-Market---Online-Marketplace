import { apiRequest } from "../services/api.js";
import { formatPrice } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { refreshCartCount } from "../services/state.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router.js";
let appliedCoupon = null;
export async function renderCartPage() {
  const res = await apiRequest("/cart");
  const items = res.success ? res.items : [];
  const pricing = res.pricing || { subtotal: 0, deliveryCharge: 0, total: 0 };
  const subtotal = pricing.subtotal;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryCharge = subtotal - couponDiscount >= 499 || subtotal === 0 ? 0 : 49;
  const finalTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge);
  if (items.length === 0) {
    return `
      <div class="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div class="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          ${icon("cart", "w-10 h-10")}
        </div>
        <h1 class="text-2xl font-black text-slate-900">Your Cart is Currently Empty</h1>
        <p class="text-slate-500 text-sm max-w-sm mx-auto">
          Explore our range of contractor tools, smart electricals, and plumbing supplies to add items.
        </p>
        <div class="pt-2">
          <a href="/products" data-link class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">
            <span>Start Shopping</span>
            ${icon("arrowRight", "w-4 h-4")}
          </a>
        </div>
      </div>
    `;
  }
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <div class="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p class="text-xs text-slate-500">${items.length} unique items in your cart</p>
        </div>
        <button id="clear-cart-btn" class="text-xs font-bold text-red-600 hover:underline cursor-pointer">
          Clear Cart
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            ${items.map((item) => `
              <div class="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <!-- Product Preview & Info -->
                <div class="flex items-center gap-4 flex-1">
                  <a href="/products/${item.productId}" data-link class="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
                    <img src="${getProductImage(item.image)}" alt="${item.name}" ${IMAGE_FALLBACK_ATTR} class="max-w-full max-h-full object-contain" />
                  </a>

                  <div class="space-y-1 min-w-0">
                    <span class="text-[11px] font-bold text-orange-600 uppercase tracking-wider">${item.category}</span>
                    <a href="/products/${item.productId}" data-link class="block text-sm font-bold text-slate-900 hover:text-orange-600 line-clamp-1 transition-colors">
                      ${item.name}
                    </a>
                    ${item.variant ? `
                      <div class="text-xs text-slate-500 font-medium">Selected: <span class="font-bold text-slate-700">${item.variant}</span></div>
                    ` : ""}
                    <div class="text-xs font-mono text-slate-400">SKU: ${item.sku}</div>
                  </div>
                </div>

                <!-- Price & Quantity Controls -->
                <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div class="text-left sm:text-right">
                    <div class="text-base font-black text-slate-900">${formatPrice(item.price * item.quantity)}</div>
                    <div class="text-[11px] text-slate-400 font-medium">${formatPrice(item.price)} each</div>
                  </div>

                  <!-- Qty Modifier -->
                  <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                    <button class="cart-qty-btn px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors" data-id="${item.productId}" data-variant="${item.variant || ""}" data-action="dec">
                      ${icon("minus", "w-3 h-3")}
                    </button>
                    <span class="px-3 py-1 text-xs font-bold text-slate-900 bg-white">${item.quantity}</span>
                    <button class="cart-qty-btn px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors" data-id="${item.productId}" data-variant="${item.variant || ""}" data-action="inc" data-qty="${item.quantity}">
                      ${icon("plus", "w-3 h-3")}
                    </button>
                  </div>

                  <!-- Remove Button -->
                  <button class="cart-remove-btn text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors" data-id="${item.productId}" data-variant="${item.variant || ""}" title="Remove item">
                    ${icon("trash", "w-4 h-4")}
                  </button>
                </div>

              </div>
            `).join("")}
          </div>

          <!-- Free Delivery Progress Tracker -->
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0">
              ${icon("truck", "w-4 h-4")}
            </div>
            <div class="text-xs text-orange-950 font-medium">
              ${subtotal >= 499 ? `
                <span class="font-bold text-emerald-800">You have qualified for Free Express Delivery!</span>
              ` : `
                Add <span class="font-black text-orange-600">${formatPrice(499 - subtotal)}</span> more of eligible products to qualify for Free Shipping.
              `}
            </div>
          </div>
        </div>

        <!-- RIGHT: Order Summary Card & Coupon -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h2 class="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <!-- Coupon Input -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700">Have a promotional coupon?</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  id="coupon-code-input"
                  placeholder="e.g. NIVORA10"
                  value="${appliedCoupon?.code || ""}"
                  class="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold uppercase text-slate-900 w-full focus:border-orange-500 outline-hidden"
                  ${appliedCoupon ? "disabled" : ""}
                />
                <button
                  id="apply-coupon-btn"
                  class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  ${appliedCoupon ? "disabled" : ""}
                >
                  ${appliedCoupon ? "Applied" : "Apply"}
                </button>
              </div>
              <div class="text-[11px] text-slate-400">Try coupon <span class="font-mono text-orange-600 font-bold">NIVORA10</span> for 10% off</div>
              ${appliedCoupon ? `
                <div class="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md font-bold mt-2">
                  <span>Coupon '${appliedCoupon.code}' applied</span>
                  <button id="remove-coupon-btn" class="text-red-600 hover:underline text-[11px]">Remove</button>
                </div>
              ` : ""}
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span class="font-bold text-slate-900">${formatPrice(subtotal)}</span>
              </div>

              ${couponDiscount > 0 ? `
                <div class="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${formatPrice(couponDiscount)}</span>
                </div>
              ` : ""}

              <div class="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span class="${deliveryCharge === 0 ? "text-emerald-700 font-bold" : "font-bold text-slate-900"}">
                  ${deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                </span>
              </div>

              <div class="flex justify-between text-slate-600">
                <span>Estimated Taxes (GST)</span>
                <span class="text-slate-500">Included in prices</span>
              </div>

              <div class="flex justify-between items-baseline pt-3 border-t border-slate-200 text-base">
                <span class="font-bold text-slate-900">Total Payable</span>
                <span class="text-2xl font-black text-slate-900">${formatPrice(finalTotal)}</span>
              </div>
            </div>

            <!-- Checkout Button -->
            <button
              id="proceed-checkout-btn"
              class="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              ${icon("arrowRight", "w-4 h-4")}
            </button>
          </div>

          <!-- Trust Badges -->
          <div class="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-2">
            <div class="flex items-center gap-2 font-bold text-slate-800">
              ${icon("shield", "w-4 h-4 text-orange-600")} Safe & Secure Demo Checkout
            </div>
            <p class="text-[11px] text-slate-500">
              Transactions are simulated securely for college major project evaluation. No real bank charges apply.
            </p>
          </div>
        </div>

      </div>

    </div>
  `;
}
export function attachCartPageEvents() {
  const reloadCart = () => {
    renderCartPage().then((html) => {
      const app = document.getElementById("app-content");
      if (app) {
        app.innerHTML = html;
        attachCartPageEvents();
      }
    });
  };
  document.querySelectorAll(".cart-qty-btn").forEach((btn) => {
    btn.onclick = async () => {
      const productId = btn.getAttribute("data-id");
      const variant = btn.getAttribute("data-variant") || void 0;
      const action = btn.getAttribute("data-action");
      const curQty = parseInt(btn.getAttribute("data-qty") || "1", 10);
      if (!productId) return;
      const newQty = action === "inc" ? curQty + 1 : curQty - 1;
      const res = await apiRequest("/cart/update", {
        method: "PUT",
        body: JSON.stringify({ productId, quantity: newQty, variant })
      });
      if (res.success) {
        await refreshCartCount();
        reloadCart();
      } else {
        showToast(res.message || "Could not update quantity", "error");
      }
    };
  });
  document.querySelectorAll(".cart-remove-btn").forEach((btn) => {
    btn.onclick = async () => {
      const productId = btn.getAttribute("data-id");
      const variant = btn.getAttribute("data-variant");
      if (!productId) return;
      const res = await apiRequest(`/cart/remove/${productId}${variant ? `?variant=${encodeURIComponent(variant)}` : ""}`, {
        method: "DELETE"
      });
      if (res.success) {
        showToast(res.message || "Item removed from cart", "info");
        await refreshCartCount();
        reloadCart();
      }
    };
  });
  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) {
    clearBtn.onclick = async () => {
      if (confirm("Are you sure you want to empty your shopping cart?")) {
        await apiRequest("/cart/clear", { method: "DELETE" });
        appliedCoupon = null;
        await refreshCartCount();
        reloadCart();
      }
    };
  }
  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  const couponInput = document.getElementById("coupon-code-input");
  if (applyCouponBtn && couponInput) {
    applyCouponBtn.onclick = async () => {
      const code = couponInput.value.trim();
      if (!code) {
        showToast("Please enter a coupon code", "warning");
        return;
      }
      const cartRes = await apiRequest("/cart");
      const subtotal = cartRes.pricing?.subtotal || 0;
      const res = await apiRequest("/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code, subtotal })
      });
      if (res.success && res.coupon) {
        appliedCoupon = res.coupon;
        showToast(res.message, "success");
        reloadCart();
      } else {
        showToast(res.message || "Invalid coupon code", "error");
      }
    };
  }
  const removeCouponBtn = document.getElementById("remove-coupon-btn");
  if (removeCouponBtn) {
    removeCouponBtn.onclick = () => {
      appliedCoupon = null;
      showToast("Coupon removed", "info");
      reloadCart();
    };
  }
  const checkoutBtn = document.getElementById("proceed-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      sessionStorage.setItem("nivora_checkout_coupon", appliedCoupon?.code || "");
      navigate("/checkout");
    };
  }
}
