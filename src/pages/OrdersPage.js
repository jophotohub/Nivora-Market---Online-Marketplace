import { apiRequest } from "../services/api.js";
import { formatPrice, formatDate } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { getProductImage, IMAGE_FALLBACK_ATTR } from "../utils/image.js";
import { showToast } from "../components/Toast.js";
let activeFilter = "ALL";
export async function renderOrdersPage() {
  const res = await apiRequest("/orders/my-orders");
  const allOrders = res.success ? res.orders : [];
  let orders = allOrders;
  if (activeFilter === "TRANSIT") {
    orders = allOrders.filter((o) => ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status));
  } else if (activeFilter === "DELIVERED") {
    orders = allOrders.filter((o) => o.status === "DELIVERED");
  } else if (activeFilter === "CANCELLED") {
    orders = allOrders.filter((o) => o.status === "CANCELLED");
  }
  return `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p class="text-xs text-slate-500">Track shipments, download invoices, and manage past purchases</p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button class="order-filter-tab px-3 py-1.5 rounded-lg transition-colors ${activeFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}" data-filter="ALL">
            All (${allOrders.length})
          </button>
          <button class="order-filter-tab px-3 py-1.5 rounded-lg transition-colors ${activeFilter === "TRANSIT" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}" data-filter="TRANSIT">
            In Transit
          </button>
          <button class="order-filter-tab px-3 py-1.5 rounded-lg transition-colors ${activeFilter === "DELIVERED" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}" data-filter="DELIVERED">
            Delivered
          </button>
          <button class="order-filter-tab px-3 py-1.5 rounded-lg transition-colors ${activeFilter === "CANCELLED" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}" data-filter="CANCELLED">
            Cancelled
          </button>
        </div>
      </div>

      ${orders.length === 0 ? `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div class="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            ${icon("package", "w-8 h-8")}
          </div>
          <h2 class="text-lg font-black text-slate-900">No orders found</h2>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">You do not have any orders in this category yet.</p>
          <a href="/products" data-link class="inline-block px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors">
            Start Shopping
          </a>
        </div>
      ` : `
        <div class="space-y-4">
          ${orders.map((order) => {
    const isCanCancel = ["PLACED", "CONFIRMED", "PACKED"].includes(order.status);
    const statusColor = order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : order.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";
    return `
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <!-- Header -->
                <div class="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div class="flex items-center gap-6">
                    <div>
                      <div class="text-slate-500 uppercase font-bold text-[10px]">Order Placed</div>
                      <div class="font-bold text-slate-900">${formatDate(order.createdAt)}</div>
                    </div>
                    <div>
                      <div class="text-slate-500 uppercase font-bold text-[10px]">Total</div>
                      <div class="font-black text-slate-900">${formatPrice(order.pricing?.total || 0)}</div>
                    </div>
                    <div>
                      <div class="text-slate-500 uppercase font-bold text-[10px]">Ship To</div>
                      <div class="font-bold text-slate-900 truncate max-w-[120px]">${order.shippingAddress?.fullName}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="font-mono text-slate-500">#${order.orderId}</span>
                    <span class="px-2.5 py-1 rounded font-bold text-[11px] ${statusColor}">
                      ${order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <!-- Body: Order Items -->
                <div class="p-4 sm:p-6 space-y-4">
                  <div class="divide-y divide-slate-100">
                    ${order.items.map((item) => `
                      <div class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                          <img src="${getProductImage(item.image)}" alt="${item.name}" ${IMAGE_FALLBACK_ATTR} class="w-16 h-16 object-contain bg-slate-50 p-1 rounded-lg border border-slate-200 flex-shrink-0" />
                          <div class="space-y-0.5">
                            <a href="/products/${item.productId}" data-link class="text-sm font-bold text-slate-900 hover:text-orange-600 line-clamp-1 transition-colors">
                              ${item.name}
                            </a>
                            <div class="text-xs text-slate-500">Qty: ${item.quantity} \xD7 ${formatPrice(item.price)}</div>
                            ${item.variant ? `<div class="text-[11px] text-slate-400">Variant: ${item.variant}</div>` : ""}
                          </div>
                        </div>

                        <div class="text-sm font-black text-slate-900">
                          ${formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    `).join("")}
                  </div>

                  <!-- Actions Bar -->
                  <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div class="text-xs text-slate-600">
                      ${order.status === "DELIVERED" ? `
                        <span class="text-emerald-700 font-bold">Package was delivered successfully</span>
                      ` : `
                        <span>Estimated Delivery: <strong class="text-slate-900">${order.estimatedDelivery}</strong></span>
                      `}
                    </div>

                    <div class="flex items-center gap-2">
                      <a
                        href="/orders/${order._id}/tracking"
                        data-link
                        class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        Track Shipment
                      </a>

                      <button
                        class="print-invoice-btn px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        data-id="${order._id}"
                      >
                        Print Invoice
                      </button>

                      ${isCanCancel ? `
                        <button
                          class="cancel-order-btn px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          data-id="${order._id}"
                        >
                          Cancel Order
                        </button>
                      ` : ""}
                    </div>
                  </div>
                </div>

              </div>
            `;
  }).join("")}
        </div>
      `}

    </div>
  `;
}
export function attachOrdersPageEvents() {
  const reload = () => {
    renderOrdersPage().then((html) => {
      const app = document.getElementById("app-content");
      if (app) {
        app.innerHTML = html;
        attachOrdersPageEvents();
      }
    });
  };
  document.querySelectorAll(".order-filter-tab").forEach((tab) => {
    tab.onclick = () => {
      activeFilter = tab.getAttribute("data-filter") || "ALL";
      reload();
    };
  });
  document.querySelectorAll(".cancel-order-btn").forEach((btn) => {
    btn.onclick = async () => {
      const orderId = btn.getAttribute("data-id");
      if (!orderId) return;
      if (confirm("Are you sure you want to cancel this order?")) {
        const res = await apiRequest(`/orders/${orderId}/cancel`, {
          method: "POST",
          body: JSON.stringify({ reason: "Customer requested cancellation via portal" })
        });
        if (res.success) {
          showToast("Order cancelled successfully", "info");
          reload();
        } else {
          showToast(res.message || "Could not cancel order", "error");
        }
      }
    };
  });
  document.querySelectorAll(".print-invoice-btn").forEach((btn) => {
    btn.onclick = () => {
      window.print();
    };
  });
}
