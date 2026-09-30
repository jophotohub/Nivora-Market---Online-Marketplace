import { apiRequest } from "../services/api.js";
import { refreshCartCount, refreshNotifications } from "../services/state.js";
import { navigate } from "../router.js";
export function renderPaymentProcessingPage() {
  return `
    <div class="max-w-md mx-auto px-4 py-20 text-center space-y-8">
      
      <!-- Animated Spinner Ring -->
      <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div class="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
        <div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-extrabold text-2xl">
          \u20B9
        </div>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Processing Simulated Payment</h1>
        <p id="payment-status-message" class="text-sm font-medium text-slate-600">
          Connecting to secure banking gateway...
        </p>
      </div>

      <!-- Step Badges -->
      <div class="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-left">
        <div id="step-1" class="flex items-center gap-3 text-xs font-bold text-orange-600">
          <div class="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></div>
          <span>Authenticating demo transaction credentials</span>
        </div>
        <div id="step-2" class="flex items-center gap-3 text-xs font-medium text-slate-400">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <span>Allocating warehouse inventory and reserving stock</span>
        </div>
        <div id="step-3" class="flex items-center gap-3 text-xs font-medium text-slate-400">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <span>Generating DEMO-TXN transaction proof</span>
        </div>
      </div>

      <div class="text-[11px] text-slate-400">
        Please do not refresh or close this browser window.
      </div>
    </div>
  `;
}
export function attachPaymentProcessingEvents() {
  const statusMsg = document.getElementById("payment-status-message");
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const step3 = document.getElementById("step-3");
  const addrJson = sessionStorage.getItem("nivora_checkout_address");
  const paymentMethod = sessionStorage.getItem("nivora_checkout_payment_method") || "DEMO_UPI";
  const couponCode = sessionStorage.getItem("nivora_checkout_coupon") || "";
  if (!addrJson) {
    navigate("/checkout");
    return;
  }
  const shippingAddress = JSON.parse(addrJson);
  setTimeout(() => {
    if (statusMsg) statusMsg.textContent = "Allocating warehouse stock & packaging reservation...";
    if (step1) {
      step1.className = "flex items-center gap-3 text-xs font-bold text-emerald-600";
      step1.innerHTML = `<span class="text-emerald-600">\u2713</span> <span>Credentials verified</span>`;
    }
    if (step2) {
      step2.className = "flex items-center gap-3 text-xs font-bold text-orange-600";
      step2.innerHTML = `<div class="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></div> <span>Allocating warehouse inventory...</span>`;
    }
  }, 1e3);
  setTimeout(async () => {
    if (statusMsg) statusMsg.textContent = "Finalizing DEMO transaction approval...";
    if (step2) {
      step2.className = "flex items-center gap-3 text-xs font-bold text-emerald-600";
      step2.innerHTML = `<span class="text-emerald-600">\u2713</span> <span>Inventory reserved</span>`;
    }
    if (step3) {
      step3.className = "flex items-center gap-3 text-xs font-bold text-orange-600";
      step3.innerHTML = `<div class="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></div> <span>Authorizing transaction stamp...</span>`;
    }
    try {
      const res = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
          couponCode
        })
      });
      if (res.success && res.order) {
        await refreshCartCount();
        await refreshNotifications();
        sessionStorage.removeItem("nivora_checkout_address");
        sessionStorage.removeItem("nivora_checkout_coupon");
        navigate(`/order-success?orderId=${res.order._id}`);
      } else {
        alert(res.message || "Payment simulation failed");
        navigate("/checkout");
      }
    } catch (e) {
      navigate("/checkout");
    }
  }, 2200);
}
