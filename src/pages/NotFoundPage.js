import { icon } from "../utils/icons.js";
export function renderNotFoundPage() {
  return `
    <div class="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div class="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
        ${icon("info", "w-10 h-10")}
      </div>
      
      <div class="space-y-2">
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p class="text-sm text-slate-500 max-w-md mx-auto">
          The page or product link you requested might have been moved, renamed, or is temporarily unavailable.
        </p>
      </div>

      <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
        <a href="/" data-link class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">
          Return to Nivora Homepage
        </a>
        <a href="/products" data-link class="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-bold shadow-xs transition-colors">
          Browse All Products
        </a>
      </div>
    </div>
  `;
}
