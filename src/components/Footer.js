import { icon } from "../utils/icons.js";
import { showToast } from "./Toast.js";
export function renderFooter() {
  return `
    <footer class="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <!-- Main Footer Columns -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          <!-- Column 1: Brand Info -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">
                N
              </div>
              <div class="flex flex-col leading-none">
                <span class="text-2xl font-black tracking-tight text-white">Nivora</span>
                <span class="text-[10px] font-bold tracking-widest text-orange-500 uppercase">MARKET</span>
              </div>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed max-w-sm">
              Nivora Market is India's high-reliability e-commerce marketplace for tools, electrical equipment, plumbing hardware, and everyday electronics. Built for both professional tradespeople and homeowners.
            </p>
          </div>

          <!-- Column 2: Marketplace -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Marketplace</h4>
            <ul class="space-y-2 text-xs text-slate-400">
              <li><a href="/products?sort=discount" data-link class="hover:text-orange-400 transition-colors">Hot Deals & Discounts</a></li>
              <li><a href="/category/tools" data-link class="hover:text-orange-400 transition-colors">Tools & Hardware</a></li>
              <li><a href="/category/electrical" data-link class="hover:text-orange-400 transition-colors">Electrical Supplies</a></li>
              <li><a href="/category/plumbing" data-link class="hover:text-orange-400 transition-colors">Plumbing Picks</a></li>
              <li><a href="/category/electronics" data-link class="hover:text-orange-400 transition-colors">Consumer Electronics</a></li>
              <li><a href="/products" data-link class="hover:text-orange-400 transition-colors">Contractor Specials</a></li>
            </ul>
          </div>

          <!-- Column 3: Customer Service -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Service</h4>
            <ul class="space-y-2 text-xs text-slate-400">
              <li><a href="/orders" data-link class="hover:text-orange-400 transition-colors">Track Your Order</a></li>
              <li><a href="/orders" data-link class="hover:text-orange-400 transition-colors">Returns & Refunds</a></li>
              <li><a href="/profile/addresses" data-link class="hover:text-orange-400 transition-colors">Shipping Information</a></li>
              <li><a href="/profile" data-link class="hover:text-orange-400 transition-colors">Account Settings</a></li>
              <li><a href="/notifications" data-link class="hover:text-orange-400 transition-colors">Order Notifications</a></li>
              <li><a href="/admin/login" data-link class="text-slate-400 hover:text-orange-400 font-medium transition-colors">Admin Login</a></li>
            </ul>
          </div>

          <!-- Column 4: For Sellers & Partners -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">For Sellers</h4>
            <ul class="space-y-2 text-xs text-slate-400">
              <li><a href="/products" data-link class="hover:text-orange-400 transition-colors">Sell on Nivora</a></li>
              <li><a href="/products" data-link class="hover:text-orange-400 transition-colors">Commercial B2B Pricing</a></li>
              <li><a href="/products" data-link class="hover:text-orange-400 transition-colors">Fulfillment by Nivora</a></li>
              <li><a href="/products" data-link class="hover:text-orange-400 transition-colors">Seller Policies</a></li>
              <li><a href="/products" data-link class="hover:text-orange-400 transition-colors">Brand Protection</a></li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Final Bottom Utility Bar -->
      <div class="border-t border-slate-800 bg-slate-950 py-3 px-4 text-xs text-slate-300">
        <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <!-- Left / Center Links with Gold/Orange Icons -->
          <div class="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2.5">
            <a href="/admin/login" data-link class="group inline-flex items-center gap-2 hover:text-amber-400 transition-colors">
              <span class="text-amber-400 transition-transform group-hover:scale-110 flex-shrink-0">
                ${icon("store", "w-4 h-4")}
              </span>
              <span class="font-medium text-slate-200 group-hover:text-amber-400">Become a Seller</span>
            </a>

            <button id="footer-advertise-btn" type="button" class="group inline-flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-0 p-0">
              <span class="text-amber-400 transition-transform group-hover:scale-110 flex-shrink-0">
                ${icon("megaphone", "w-4 h-4")}
              </span>
              <span class="font-medium text-slate-200 group-hover:text-amber-400">Advertise</span>
            </button>

            <button id="footer-giftcard-btn" type="button" class="group inline-flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-0 p-0">
              <span class="text-amber-400 transition-transform group-hover:scale-110 flex-shrink-0">
                ${icon("gift", "w-4 h-4")}
              </span>
              <span class="font-medium text-slate-200 group-hover:text-amber-400">Gift Cards</span>
            </button>

            <a href="/notifications" data-link id="footer-help-link" class="group inline-flex items-center gap-2 hover:text-amber-400 transition-colors">
              <span class="text-amber-400 transition-transform group-hover:scale-110 flex-shrink-0">
                ${icon("helpCircle", "w-4 h-4")}
              </span>
              <span class="font-medium text-slate-200 group-hover:text-amber-400">Help Center</span>
            </a>
          </div>

          <!-- Right Side: Copyright & Demo Payment Badges -->
          <div class="flex flex-wrap items-center justify-center lg:justify-end gap-x-5 gap-y-2.5">
            <span class="text-slate-400 font-normal whitespace-nowrap text-xs">
              &copy; 2026 Nivora Market. All rights reserved.
            </span>

            <!-- Demo Payment Badges -->
            <div class="flex flex-wrap items-center justify-center gap-1.5" title="Demo simulated payment methods - College major project showcase">
              <!-- Visa -->
              <div class="h-5 px-2 bg-white rounded flex items-center justify-center shadow-2xs hover:brightness-105 transition-all select-none">
                <span class="text-[10px] font-black tracking-tight text-blue-700 italic">VISA</span>
              </div>

              <!-- Mastercard -->
              <div class="h-5 px-1.5 bg-white rounded flex items-center justify-center gap-1 shadow-2xs hover:brightness-105 transition-all select-none">
                <span class="inline-flex -space-x-1 items-center">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block opacity-90"></span>
                </span>
                <span class="text-[8.5px] font-bold text-slate-900 tracking-tight">Mastercard</span>
              </div>

              <!-- UPI -->
              <div class="h-5 px-2 bg-white rounded flex items-center justify-center gap-1 shadow-2xs hover:brightness-105 transition-all select-none">
                <span class="text-[9px] font-black text-emerald-700 tracking-wider">UPI</span>
                <svg class="w-2.5 h-2.5 text-orange-500 fill-current" viewBox="0 0 24 24"><polygon points="12 2 4 12 9 12 9 22 15 22 15 12 20 12 12 2"/></svg>
              </div>

              <!-- RuPay -->
              <div class="h-5 px-2 bg-white rounded flex items-center justify-center gap-0.5 shadow-2xs hover:brightness-105 transition-all select-none">
                <span class="text-[9px] font-black text-cyan-800">Ru</span><span class="text-[9px] font-black text-orange-600">Pay</span>
              </div>

              <!-- Net Banking -->
              <div class="h-5 px-2 bg-white rounded flex items-center justify-center gap-1 shadow-2xs hover:brightness-105 transition-all select-none">
                <svg class="w-2.5 h-2.5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/></svg>
                <span class="text-[8px] font-bold text-slate-800 tracking-tight">NetBanking</span>
              </div>

              <!-- Cash on Delivery -->
              <div class="h-5 px-2 bg-white rounded flex items-center justify-center gap-1 shadow-2xs hover:brightness-105 transition-all select-none">
                <span class="text-[8.5px] font-extrabold text-emerald-800 tracking-wider">COD</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </footer>
  `;
}
export function attachFooterEvents() {
  const advertiseBtn = document.getElementById("footer-advertise-btn");
  if (advertiseBtn) {
    advertiseBtn.onclick = () => {
      showToast("Nivora Merchant Ads: Contact partner-ads@nivora.market to feature your products.", "info");
    };
  }

  const giftCardBtn = document.getElementById("footer-giftcard-btn");
  if (giftCardBtn) {
    giftCardBtn.onclick = () => {
      showToast("Nivora Gift Cards: Available in ₹500, ₹1000, and ₹5000 denominations.", "info");
    };
  }
}
