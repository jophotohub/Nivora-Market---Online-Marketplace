import { apiRequest } from "../services/api.js";
import { formatDateTime } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
export async function renderOrderTrackingPage(orderId) {
  const res = await apiRequest(`/orders/${orderId}/tracking`);
  if (!res.success) {
    return `
      <div class="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 class="text-xl font-bold text-slate-900">Order Tracking Not Found</h1>
        <p class="text-xs text-slate-500">The tracking record for this order could not be retrieved.</p>
        <a href="/orders" data-link class="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">
          Back to My Orders
        </a>
      </div>
    `;
  }
  const {
    orderId: displayOrderId,
    status,
    stages = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"],
    currentStageIndex = 0,
    trackingNumber,
    estimatedDelivery,
    timeline = [],
    items = [],
    shippingAddress
  } = res;
  const isCancelled = status === "CANCELLED";
  return `
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-slate-500">
        <a href="/" data-link class="hover:text-orange-600">Home</a>
        ${icon("chevronRight", "w-3 h-3 text-slate-400")}
        <a href="/orders" data-link class="hover:text-orange-600">Orders</a>
        ${icon("chevronRight", "w-3 h-3 text-slate-400")}
        <span class="font-bold text-slate-800">Track #${displayOrderId}</span>
      </nav>

      <!-- Main Tracking Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-8">
        
        <!-- Header Info -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="text-xs font-bold text-orange-600 uppercase tracking-wider">Live Shipment Status</div>
            <h1 class="text-2xl font-black text-slate-900 mt-0.5">Order #${displayOrderId}</h1>
            <p class="text-xs text-slate-500">Carrier: Nivora Express Logistics (AWB: <strong class="text-slate-800">${trackingNumber}</strong>)</p>
          </div>

          <div class="text-left sm:text-right">
            <div class="text-xs text-slate-500 font-bold">Estimated Delivery</div>
            <div class="text-base font-black text-slate-900">${estimatedDelivery}</div>
          </div>
        </div>

        ${isCancelled ? `
          <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
            ${icon("x", "w-5 h-5 text-red-600")}
            <span>This order was cancelled. Re-order is available in your order history.</span>
          </div>
        ` : `
          <!-- 6-STAGE VISUAL TIMELINE STEPPER -->
          <div class="relative py-4">
            
            <!-- Mobile Vertical / Desktop Horizontal Stepper -->
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
              ${stages.map((stage, idx) => {
    const isPassed = idx <= currentStageIndex;
    const isCurrent = idx === currentStageIndex;
    const stageNames = {
      PLACED: "Placed",
      CONFIRMED: "Confirmed",
      PACKED: "Packed",
      SHIPPED: "Shipped",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered"
    };
    return `
                  <div class="flex flex-col items-center text-center space-y-2 relative z-10">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isPassed ? "bg-orange-600 text-white shadow-xs" : "bg-slate-100 text-slate-400 border border-slate-200"} ${isCurrent ? "ring-4 ring-orange-100 ring-offset-1 scale-110" : ""}">
                      ${isPassed ? icon("check", "w-4 h-4") : idx + 1}
                    </div>
                    <div>
                      <div class="text-xs font-bold ${isPassed ? "text-slate-900" : "text-slate-400"}">
                        ${stageNames[stage] || stage}
                      </div>
                      ${isCurrent ? '<span class="inline-block mt-0.5 px-1.5 py-0.2 bg-orange-100 text-orange-800 text-[9px] font-black rounded uppercase">ACTIVE</span>' : ""}
                    </div>
                  </div>
                `;
  }).join("")}
            </div>

          </div>
        `}

        <!-- Activity History Log -->
        <div class="pt-6 border-t border-slate-100 space-y-4">
          <h2 class="text-sm font-black text-slate-900">Shipment Milestones</h2>
          <div class="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            ${timeline.map((event) => `
              <div class="relative space-y-0.5 text-xs">
                <div class="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-orange-600 ring-4 ring-white"></div>
                <div class="font-bold text-slate-900">${event.status}</div>
                <div class="text-[11px] text-slate-500">${formatDateTime(event.timestamp)}</div>
                <div class="text-slate-600 text-xs">${event.note}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Shipment Items & Address Summary -->
        <div class="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 class="font-bold text-slate-900 mb-2">Delivery Destination</h3>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div class="font-bold text-slate-800">${shippingAddress?.fullName}</div>
              <div class="text-slate-600">${shippingAddress?.street}</div>
              <div class="text-slate-600">${shippingAddress?.city}, ${shippingAddress?.state} - ${shippingAddress?.pincode}</div>
              <div class="text-slate-500 pt-1">Phone: ${shippingAddress?.phone}</div>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-slate-900 mb-2">Package Contents (${items.length} items)</h3>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              ${items.map((i) => `
                <div class="flex items-center gap-2.5">
                  <img src="${getProductImage(i.image)}" alt="${i.name}" ${IMAGE_FALLBACK_ATTR} class="w-8 h-8 object-contain bg-white rounded p-0.5 border border-slate-200" />
                  <div class="flex-1 truncate font-medium text-slate-800">${i.name}</div>
                  <div class="font-bold text-slate-900">\xD7${i.quantity}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
