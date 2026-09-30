import { icon } from "../utils/icons.js";
export function showToast(message, type = "success", duration = 3200) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform duration-300 translate-y-3 opacity-0 ${type === "success" ? "bg-slate-900 text-white border-slate-800" : type === "error" ? "bg-red-600 text-white border-red-700" : type === "warning" ? "bg-amber-600 text-white border-amber-700" : "bg-slate-900 text-white border-slate-800"}`;
  const iconHtml = type === "success" ? icon("check", "w-4 h-4 text-emerald-400") : type === "error" ? icon("x", "w-4 h-4 text-white") : icon("info", "w-4 h-4 text-orange-400");
  toast.innerHTML = `
    <span class="flex-shrink-0">${iconHtml}</span>
    <span class="flex-1">${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-3", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });
  setTimeout(() => {
    toast.classList.add("translate-y-3", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
