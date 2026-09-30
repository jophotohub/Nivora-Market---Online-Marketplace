import { icon } from "../utils/icons.js";
import { SEED_CATEGORIES } from "../../server/seedData.js";
export function renderCategoryBar(activeSlug) {
  return `
    <nav class="bg-white border-b border-slate-200 py-2.5 px-4 shadow-2xs relative">
      <div class="max-w-7xl mx-auto relative group">
        <!-- Scroll Left Button -->
        <button id="cat-scroll-left" class="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-slate-300 rounded-full items-center justify-center text-slate-600 shadow-md hover:text-orange-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          ${icon("chevronLeft", "w-4 h-4")}
        </button>

        <!-- Category Items Scroll Container -->
        <div id="category-scroll-container" class="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1">
          <a
            href="/products"
            data-link
            class="flex flex-col items-center gap-1 min-w-[70px] text-center group/item transition-colors ${!activeSlug ? "text-orange-600 font-bold" : "text-slate-600 hover:text-orange-600 font-medium"}"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all ${!activeSlug ? "bg-orange-100 text-orange-600 shadow-xs" : "bg-slate-100 text-slate-600 group-hover/item:bg-orange-50 group-hover/item:text-orange-600"}">
              ${icon("tag", "w-5 h-5")}
            </div>
            <span class="text-xs whitespace-nowrap">All Items</span>
          </a>

          ${SEED_CATEGORIES.map((cat) => {
    const isActive = activeSlug === cat.slug;
    return `
              <a
                href="/category/${cat.slug}"
                data-link
                class="flex flex-col items-center gap-1 min-w-[70px] text-center group/item transition-colors ${isActive ? "text-orange-600 font-bold" : "text-slate-600 hover:text-orange-600 font-medium"}"
              >
                <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-orange-100 text-orange-600 shadow-xs ring-2 ring-orange-500/20" : "bg-slate-100 text-slate-600 group-hover/item:bg-orange-50 group-hover/item:text-orange-600"}">
                  ${icon(cat.icon, "w-5 h-5")}
                </div>
                <span class="text-xs whitespace-nowrap">${cat.name}</span>
              </a>
            `;
  }).join("")}
        </div>

        <!-- Scroll Right Button -->
        <button id="cat-scroll-right" class="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-slate-300 rounded-full items-center justify-center text-slate-600 shadow-md hover:text-orange-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          ${icon("chevronRight", "w-4 h-4")}
        </button>
      </div>
    </nav>
  `;
}
export function attachCategoryBarEvents() {
  const container = document.getElementById("category-scroll-container");
  const btnLeft = document.getElementById("cat-scroll-left");
  const btnRight = document.getElementById("cat-scroll-right");
  if (container && btnLeft && btnRight) {
    btnLeft.onclick = () => {
      container.scrollBy({ left: -240, behavior: "smooth" });
    };
    btnRight.onclick = () => {
      container.scrollBy({ left: 240, behavior: "smooth" });
    };
  }
}
