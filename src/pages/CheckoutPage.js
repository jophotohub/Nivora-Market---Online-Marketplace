import { apiRequest } from "../services/api.js";
import { formatPrice } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { getState } from "../services/state.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router.js";
let selectedAddressId = null;
let selectedPaymentMethod = "DEMO_UPI";
export async function renderCheckoutPage() {
  const { user } = getState();
  const cartRes = await apiRequest("/cart");
  const items = cartRes.success ? cartRes.items : [];
  if (items.length === 0) {
    navigate("/cart");
    return "";
  }
  let addresses = [];
  if (user) {
    const addrRes = await apiRequest("/auth/addresses");
    if (addrRes.success && addrRes.addresses) {
      addresses = addrRes.addresses;
    }
  }
  if (addresses.length > 0 && !selectedAddressId) {
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    selectedAddressId = defaultAddr.id;
  }
  const couponCode = sessionStorage.getItem("nivora_checkout_coupon") || "";
  const subtotal = cartRes.pricing?.subtotal || 0;
  let discount = 0;
  if (couponCode.toUpperCase() === "NIVORA10") {
    discount = Math.round(subtotal * 0.1);
  } else if (couponCode.toUpperCase() === "FIRST50") {
    discount = 50;
  }
  const deliveryCharge = subtotal - discount >= 499 ? 0 : 49;
  const total = Math.max(0, subtotal - discount + deliveryCharge);
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <!-- Checkout Stepper Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Secure Checkout</h1>
        <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span class="text-orange-600">1. Address</span>
          <span>\u2192</span>
          <span class="text-orange-600">2. Review</span>
          <span>\u2192</span>
          <span class="text-orange-600">3. Simulated Payment</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left: Address Selection & Payment Methods -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- STEP 1: DELIVERY ADDRESS -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Select Delivery Address</span>
              </h2>
              <button id="toggle-new-address-btn" class="text-xs font-bold text-orange-600 hover:underline cursor-pointer">
                + Add New Address
              </button>
            </div>

            <!-- Saved Addresses List -->
            <div id="saved-addresses-list" class="space-y-3">
              ${addresses.map((addr) => `
                <label class="block p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddressId === addr.id ? "border-orange-600 bg-orange-50/50 shadow-xs" : "border-slate-200 hover:border-slate-300"}">
                  <div class="flex items-start gap-3">
                    <input
                      type="radio"
                      name="selected_address"
                      value="${addr.id}"
                      ${selectedAddressId === addr.id ? "checked" : ""}
                      class="mt-1 text-orange-600 focus:ring-orange-500"
                    />
                    <div class="flex-1 text-xs space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900 text-sm">${addr.fullName}</span>
                        <span class="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded ${addr.type === "work" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}">${addr.type}</span>
                        <span class="text-slate-500 font-medium">${addr.phone}</span>
                      </div>
                      <div class="text-slate-600">${addr.street}, ${addr.city}, ${addr.state} - <span class="font-bold">${addr.pincode}</span></div>
                    </div>
                  </div>
                </label>
              `).join("")}
            </div>

            <!-- New Address Form (Toggleable) -->
            <form id="new-address-form" class="${addresses.length > 0 ? "hidden" : ""} bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Enter New Delivery Address</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input type="text" id="new-addr-name" placeholder="Receiver full name" value="${user?.name || ""}" class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 outline-hidden" required />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" id="new-addr-phone" placeholder="10-digit mobile number" value="${user?.phone || ""}" class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 outline-hidden" required />
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Street Address / Landmark</label>
                <input type="text" id="new-addr-street" placeholder="Flat, house no., building, company, apartment" class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 outline-hidden" required />
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input type="text" id="new-addr-city" placeholder="City" value="Bengaluru" class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 outline-hidden" required />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <input type="text" id="new-addr-state" placeholder="State" value="Karnataka" class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 outline-hidden" required />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">PIN Code</label>
                  <input type="text" id="new-addr-pincode" placeholder="6-digit PIN" value="560001" maxlength="6" class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 outline-hidden" required />
                </div>
              </div>
              <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold cursor-pointer">
                Save & Use This Address
              </button>
            </form>
          </div>

          <!-- STEP 2: SIMULATED PAYMENT METHOD -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Select Payment Method (Simulation)</span>
            </h2>

            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                ${icon("info", "w-4 h-4 text-amber-700")} College Project Simulator
              </div>
              <p class="text-[11px] text-amber-800">
                This is a simulated demo transaction flow. No real banking details or money transfers will occur. You will receive an authentic <span class="font-mono font-bold">DEMO-TXN-XXXX</span> ID.
              </p>
            </div>

            <!-- Payment Options -->
            <div class="space-y-3 pt-2">
              <!-- Demo UPI -->
              <label class="block p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedPaymentMethod === "DEMO_UPI" ? "border-orange-600 bg-orange-50/40 shadow-xs" : "border-slate-200"}">
                <div class="flex items-start gap-3">
                  <input type="radio" name="payment_method" value="DEMO_UPI" ${selectedPaymentMethod === "DEMO_UPI" ? "checked" : ""} class="mt-1 text-orange-600" />
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-sm text-slate-900">Demo UPI / QR</span>
                      <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">FASTEST</span>
                    </div>
                    <p class="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM simulated approval</p>
                    ${selectedPaymentMethod === "DEMO_UPI" ? `
                      <div class="mt-3 pt-3 border-t border-slate-200">
                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Enter Demo Virtual Payment Address (VPA)</label>
                        <div class="flex gap-2">
                          <input type="text" id="demo-upi-id" value="contractor@okhdfcbank" class="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 w-full outline-hidden" />
                          <button type="button" id="quick-vpa-btn" class="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-300">Default VPA</button>
                        </div>
                      </div>
                    ` : ""}
                  </div>
                </div>
              </label>

              <!-- Demo Card -->
              <label class="block p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedPaymentMethod === "DEMO_CARD" ? "border-orange-600 bg-orange-50/40 shadow-xs" : "border-slate-200"}">
                <div class="flex items-start gap-3">
                  <input type="radio" name="payment_method" value="DEMO_CARD" ${selectedPaymentMethod === "DEMO_CARD" ? "checked" : ""} class="mt-1 text-orange-600" />
                  <div class="flex-1 space-y-1">
                    <span class="font-bold text-sm text-slate-900">Demo Credit / Debit Card</span>
                    <p class="text-xs text-slate-500">Simulate Visa, MasterCard, or RuPay card processing</p>
                    ${selectedPaymentMethod === "DEMO_CARD" ? `
                      <div class="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                        <div class="col-span-2">
                          <label class="block text-[11px] font-bold text-slate-700 mb-1">Demo Card Number</label>
                          <input type="text" value="4532 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 8821" readonly class="bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 w-full outline-hidden font-mono" />
                        </div>
                        <div>
                          <label class="block text-[11px] font-bold text-slate-700 mb-1">Expiry</label>
                          <input type="text" value="12/28" readonly class="bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 w-full outline-hidden font-mono" />
                        </div>
                        <div>
                          <label class="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                          <input type="password" value="888" readonly class="bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 w-full outline-hidden font-mono" />
                        </div>
                      </div>
                    ` : ""}
                  </div>
                </div>
              </label>

              <!-- Cash on Delivery -->
              <label class="block p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedPaymentMethod === "COD" ? "border-orange-600 bg-orange-50/40 shadow-xs" : "border-slate-200"}">
                <div class="flex items-start gap-3">
                  <input type="radio" name="payment_method" value="COD" ${selectedPaymentMethod === "COD" ? "checked" : ""} class="mt-1 text-orange-600" />
                  <div class="flex-1">
                    <span class="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                    <p class="text-xs text-slate-500">Pay cash or UPI to courier agent upon doorstep package receipt</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>

        <!-- Right: Order Review & Final Pay CTA -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h2 class="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Items in this Shipment (${items.length})
            </h2>

            <!-- Items mini preview list -->
            <div class="space-y-3 max-h-56 overflow-y-auto no-scrollbar">
              ${items.map((item) => `
                <div class="flex items-center gap-3 text-xs">
                  <img src="${getProductImage(item.image)}" alt="${item.name}" ${IMAGE_FALLBACK_ATTR} class="w-12 h-12 object-contain bg-slate-50 p-1 rounded-md border border-slate-200" />
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-slate-900 truncate">${item.name}</div>
                    <div class="text-slate-500">Qty: ${item.quantity} \xD7 ${formatPrice(item.price)}</div>
                  </div>
                  <div class="font-bold text-slate-900">${formatPrice(item.price * item.quantity)}</div>
                </div>
              `).join("")}
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span class="font-bold text-slate-900">${formatPrice(subtotal)}</span>
              </div>

              ${discount > 0 ? `
                <div class="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${formatPrice(discount)}</span>
                </div>
              ` : ""}

              <div class="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span class="${deliveryCharge === 0 ? "text-emerald-700 font-bold" : "font-bold text-slate-900"}">
                  ${deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                </span>
              </div>

              <div class="flex justify-between items-baseline pt-3 border-t border-slate-200 text-base">
                <span class="font-bold text-slate-900">Total Amount</span>
                <span class="text-2xl font-black text-slate-900">${formatPrice(total)}</span>
              </div>
            </div>

            <!-- Pay Now Button -->
            <button
              id="submit-pay-btn"
              class="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authorize & Place Order</span>
              ${icon("arrowRight", "w-4 h-4")}
            </button>
          </div>

          <div class="p-4 bg-slate-100 rounded-xl text-[11px] text-slate-500 text-center">
            By placing this order you agree to Nivora Market's Terms of Sale and Delivery Policy.
          </div>
        </div>

      </div>

    </div>
  `;
}
export function attachCheckoutPageEvents() {
  const reloadCheckout = () => {
    renderCheckoutPage().then((html) => {
      const app = document.getElementById("app-content");
      if (app) {
        app.innerHTML = html;
        attachCheckoutPageEvents();
      }
    });
  };
  document.querySelectorAll('input[name="selected_address"]').forEach((radio) => {
    radio.onchange = (e) => {
      selectedAddressId = e.target.value;
      reloadCheckout();
    };
  });
  const toggleBtn = document.getElementById("toggle-new-address-btn");
  const newAddrForm = document.getElementById("new-address-form");
  if (toggleBtn && newAddrForm) {
    toggleBtn.onclick = () => {
      newAddrForm.classList.toggle("hidden");
    };
  }
  if (newAddrForm) {
    newAddrForm.onsubmit = async (e) => {
      e.preventDefault();
      const fullName = document.getElementById("new-addr-name").value;
      const phone = document.getElementById("new-addr-phone").value;
      const street = document.getElementById("new-addr-street").value;
      const city = document.getElementById("new-addr-city").value;
      const state = document.getElementById("new-addr-state").value;
      const pincode = document.getElementById("new-addr-pincode").value;
      const res = await apiRequest("/auth/addresses", {
        method: "POST",
        body: JSON.stringify({ fullName, phone, street, city, state, pincode, isDefault: true, type: "home" })
      });
      if (res.success && res.addresses) {
        showToast("Address saved successfully", "success");
        const latest = res.addresses[res.addresses.length - 1];
        selectedAddressId = latest.id;
        reloadCheckout();
      } else {
        showToast(res.message || "Could not save address", "error");
      }
    };
  }
  document.querySelectorAll('input[name="payment_method"]').forEach((radio) => {
    radio.onchange = (e) => {
      selectedPaymentMethod = e.target.value;
      reloadCheckout();
    };
  });
  const quickVpaBtn = document.getElementById("quick-vpa-btn");
  const upiInput = document.getElementById("demo-upi-id");
  if (quickVpaBtn && upiInput) {
    quickVpaBtn.onclick = () => {
      upiInput.value = "nivora.buyer@okhdfcbank";
    };
  }
  const payBtn = document.getElementById("submit-pay-btn");
  if (payBtn) {
    payBtn.onclick = async () => {
      const addrRes = await apiRequest("/auth/addresses");
      const addrs = addrRes.addresses || [];
      const currentAddr = addrs.find((a) => a.id === selectedAddressId) || addrs[0];
      if (!currentAddr) {
        showToast("Please provide a delivery address before paying", "warning");
        return;
      }
      sessionStorage.setItem("nivora_checkout_address", JSON.stringify(currentAddr));
      sessionStorage.setItem("nivora_checkout_payment_method", selectedPaymentMethod);
      navigate("/payment");
    };
  }
}
