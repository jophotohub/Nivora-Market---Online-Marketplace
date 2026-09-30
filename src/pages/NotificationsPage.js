import { apiRequest } from "../services/api.js";
import { formatDateTime } from "../utils/formatters.js";
import { icon } from "../utils/icons.js";
import { refreshNotifications } from "../services/state.js";
import { showToast } from "../components/Toast.js";
export async function renderNotificationsPage() {
  const res = await apiRequest("/notifications");
  const notifications = res.success ? res.notifications : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return `
    <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <div class="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p class="text-xs text-slate-500">Stay updated on shipment deliveries, promotions, and account alerts</p>
        </div>

        ${unreadCount > 0 ? `
          <button id="mark-all-read-btn" class="text-xs font-bold text-orange-600 hover:underline cursor-pointer">
            Mark all as read
          </button>
        ` : ""}
      </div>

      ${notifications.length === 0 ? `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            ${icon("bell", "w-8 h-8")}
          </div>
          <h2 class="text-base font-bold text-slate-900">No notifications yet</h2>
          <p class="text-xs text-slate-500">We'll alert you here when your shipments progress or special deals launch.</p>
        </div>
      ` : `
        <div class="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          ${notifications.map((notif) => `
            <div class="p-4 sm:p-5 flex items-start gap-4 transition-colors ${notif.isRead ? "bg-white" : "bg-orange-50/40"}">
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === "order" ? "bg-blue-100 text-blue-600" : notif.type === "promo" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"}">
                ${notif.type === "order" ? icon("truck", "w-4 h-4") : notif.type === "promo" ? icon("tag", "w-4 h-4") : icon("bell", "w-4 h-4")}
              </div>

              <div class="flex-1 space-y-1 text-xs min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 text-sm">${notif.title}</span>
                  <span class="text-[10px] text-slate-400 font-medium">${formatDateTime(notif.createdAt)}</span>
                </div>
                <p class="text-slate-600 leading-relaxed">${notif.message}</p>
                ${notif.link ? `
                  <div class="pt-1">
                    <a href="${notif.link}" data-link class="inline-flex items-center gap-1 font-bold text-orange-600 hover:underline text-[11px]">
                      <span>View Details</span>
                      ${icon("chevronRight", "w-3 h-3")}
                    </a>
                  </div>
                ` : ""}
              </div>

              ${!notif.isRead ? `
                <button class="mark-single-read-btn text-slate-400 hover:text-slate-600 p-1 cursor-pointer" data-id="${notif._id}" title="Mark as read">
                  <div class="w-2.5 h-2.5 bg-orange-600 rounded-full"></div>
                </button>
              ` : ""}
            </div>
          `).join("")}
        </div>
      `}

    </div>
  `;
}
export function attachNotificationsPageEvents() {
  const reload = () => {
    renderNotificationsPage().then((html) => {
      const app = document.getElementById("app-content");
      if (app) {
        app.innerHTML = html;
        attachNotificationsPageEvents();
      }
    });
  };
  const markAllBtn = document.getElementById("mark-all-read-btn");
  if (markAllBtn) {
    markAllBtn.onclick = async () => {
      const res = await apiRequest("/notifications/read-all", { method: "PUT" });
      if (res.success) {
        await refreshNotifications();
        showToast("All notifications marked as read", "info");
        reload();
      }
    };
  }
  document.querySelectorAll(".mark-single-read-btn").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      if (id) {
        await apiRequest(`/notifications/${id}/read`, { method: "PUT" });
        await refreshNotifications();
        reload();
      }
    };
  });
}
