import { apiRequest } from "../services/api.js";
import { formatPrice } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
export async function renderOrderSuccessPage(orderId) {
  const res = await apiRequest(`/orders/${orderId}`);
  const order = res.order;
  return `
    <div class="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
      
      <!-- Animated Success Ring -->
      <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
        ${icon("check", "w-10 h-10")}
      </div>

      <div class="space-y-2">
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
        <p class="text-slate-600 text-sm">
          Thank you for choosing Nivora Market. Your simulated transaction has been processed successfully.
        </p>
      </div>

      <!-- Order Detail Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs text-left space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs">
          <div>
            <span class="text-slate-500">Order ID:</span>
            <span class="font-mono font-bold text-slate-900 ml-1">${order?.orderId || "NIV-ORD-NEW"}</span>
          </div>
          <div>
            <span class="text-slate-500">Demo Transaction ID:</span>
            <span class="font-mono font-bold text-orange-600 ml-1">${order?.payment?.transactionId || "DEMO-TXN-10001"}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div class="text-slate-500 font-bold mb-1">Estimated Delivery:</div>
            <div class="font-bold text-slate-900 text-sm">${order?.estimatedDelivery || "Wednesday, Oct 1"}</div>
            <div class="text-slate-500">Courier: Nivora Express (AWB: ${order?.trackingNumber})</div>
          </div>
          <div>
            <div class="text-slate-500 font-bold mb-1">Delivering to:</div>
            <div class="font-bold text-slate-900">${order?.shippingAddress?.fullName}</div>
            <div class="text-slate-600">${order?.shippingAddress?.street}, ${order?.shippingAddress?.city} - ${order?.shippingAddress?.pincode}</div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-bold">Total Amount Paid:</span>
          <span class="text-xl font-black text-slate-900">${formatPrice(order?.pricing?.total || 0)}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="/orders/${order?._id || orderId}/tracking"
          data-link
          class="w-full sm:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          ${icon("clock", "w-4 h-4")}
          <span>Track Order Status</span>
        </a>

        <a
          href="/products"
          data-link
          class="w-full sm:w-auto px-8 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-bold shadow-xs transition-colors"
        >
          Continue Shopping
        </a>
      </div>

    </div>
  `;
}
