import { apiRequest } from "../services/api.js";
import { renderProductCard, attachProductCardListeners } from "../components/ProductCard.js";
import { SEED_PROMOTIONS } from "../../server/seedData.js";
import { icon } from "../utils/icons.js";
let carouselTimer = null;
let currentSlide = 0;
export async function renderHomePage() {
  const productsRes = await apiRequest("/products?limit=24");
  const allProducts = productsRes.success ? productsRes.products : [];
  const dealsProducts = allProducts.filter((p) => p.isDeal).slice(0, 4);
  const trendingProducts = allProducts.filter((p) => p.isTrending || p.rating >= 4.8).slice(0, 4);
  const computersProducts = allProducts.filter((p) => p.categorySlug === "computers").slice(0, 4);
  const toolsProducts = allProducts.filter((p) => p.categorySlug === "tools").slice(0, 4);
  const electricalProducts = allProducts.filter((p) => p.categorySlug === "electrical").slice(0, 4);
  const plumbingProducts = allProducts.filter((p) => p.categorySlug === "plumbing").slice(0, 4);
  let recentlyViewedIds = [];
  try {
    recentlyViewedIds = JSON.parse(localStorage.getItem("nivora_recent_views") || "[]");
  } catch (e) {
  }
  const recentProducts = allProducts.filter((p) => recentlyViewedIds.includes(p._id)).slice(0, 4);
  return `
    <div class="space-y-8 pb-12">
      
      <!-- HERO CAROUSEL SECTION -->
      <section class="relative bg-slate-950 overflow-hidden shadow-md">
        <div id="hero-carousel-track" class="relative w-full h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden">
          
          <!-- Slide 1: Weekend Deals -->
          <div class="hero-slide absolute inset-0 transition-opacity duration-700 opacity-100 flex items-center" data-index="0">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1600&q=80'); filter: brightness(0.35);"></div>
            <div class="relative max-w-7xl mx-auto px-6 sm:px-12 w-full text-white space-y-4">
              <span class="inline-block bg-orange-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                LIMITED TIME EVENT
              </span>
              <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-2xl leading-none">
                Mega Contractor & Homeowner Sale
              </h1>
              <p class="text-sm sm:text-lg text-slate-300 max-w-xl">
                Up to 50% discount on industrial power tools, electrical fittings, and heavy-duty hardware.
              </p>
              <div class="pt-2 flex flex-wrap gap-4">
                <a href="/products?sort=discount" data-link class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
                  Shop Deals Now
                </a>
              </div>
            </div>
          </div>

          <!-- Slide 2: Electrical Essentials -->
          <div class="hero-slide absolute inset-0 transition-opacity duration-700 opacity-0 pointer-events-none flex items-center" data-index="1">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80'); filter: brightness(0.35);"></div>
            <div class="relative max-w-7xl mx-auto px-6 sm:px-12 w-full text-white space-y-4">
              <span class="inline-block bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                NEW TECHNOLOGY
              </span>
              <h2 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-2xl leading-none">
                Next-Gen Smart Electricals
              </h2>
              <p class="text-sm sm:text-lg text-slate-300 max-w-xl">
                Upgrade to touch-sensitive tempered glass switch plates, Wi-Fi energy plugs, and precision digital multimeters.
              </p>
              <div class="pt-2 flex flex-wrap gap-4">
                <a href="/category/electrical" data-link class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
                  Browse Electricals
                </a>
              </div>
            </div>
          </div>

          <!-- Slide 3: Plumbing Picks -->
          <div class="hero-slide absolute inset-0 transition-opacity duration-700 opacity-0 pointer-events-none flex items-center" data-index="2">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80'); filter: brightness(0.35);"></div>
            <div class="relative max-w-7xl mx-auto px-6 sm:px-12 w-full text-white space-y-4">
              <span class="inline-block bg-teal-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                LUXURY & RELIABILITY
              </span>
              <h2 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-2xl leading-none">
                Precision Engineered Plumbing
              </h2>
              <p class="text-sm sm:text-lg text-slate-300 max-w-xl">
                High-pressure rainfall shower kits, solid forged brass ball valves, and UPVC pipe connections built to last.
              </p>
              <div class="pt-2 flex flex-wrap gap-4">
                <a href="/category/plumbing" data-link class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
                  View Plumbing Range
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Navigation Controls -->
        <button id="carousel-prev" class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer z-20">
          ${icon("chevronLeft", "w-6 h-6")}
        </button>
        <button id="carousel-next" class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer z-20">
          ${icon("chevronRight", "w-6 h-6")}
        </button>

        <!-- Carousel Dots -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <button class="carousel-dot w-2.5 h-2.5 rounded-full bg-white transition-all" data-target="0"></button>
          <button class="carousel-dot w-2.5 h-2.5 rounded-full bg-white/40 transition-all" data-target="1"></button>
          <button class="carousel-dot w-2.5 h-2.5 rounded-full bg-white/40 transition-all" data-target="2"></button>
        </div>
      </section>

      <!-- PROMOTIONAL FEATURE CARDS SECTION -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${SEED_PROMOTIONS.map((promo) => `
            <a
              href="${promo.link}"
              data-link
              class="group relative h-48 rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 transition-all flex flex-col justify-end p-5"
            >
              <div
                class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style="background-image: url('${promo.image}')"
              ></div>
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"></div>
              
              <div class="relative z-10 space-y-1">
                <span class="inline-block bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  ${promo.tag}
                </span>
                <h3 class="text-white font-extrabold text-lg leading-tight group-hover:text-orange-400 transition-colors">
                  ${promo.title}
                </h3>
                <p class="text-slate-300 text-xs line-clamp-1">
                  ${promo.subtitle}
                </p>
                <div class="pt-1 flex items-center gap-1 text-xs font-bold text-orange-400">
                  <span>${promo.cta}</span>
                  ${icon("arrowRight", "w-3.5 h-3.5")}
                </div>
              </div>
            </a>
          `).join("")}
        </div>
      </section>

      <!-- DEALS WORTH CHECKING (WITH COUNTDOWN TIMER) -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm mb-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <span class="bg-white/20 text-white text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded">
                FLASH SALE
              </span>
              <h2 class="text-2xl sm:text-3xl font-black">Deals Worth Checking</h2>
              <p class="text-orange-100 text-xs sm:text-sm">Verified high-demand contractor and household gear at rock-bottom prices</p>
            </div>

            <!-- Countdown Timer Display -->
            <div class="flex items-center gap-3">
              <div class="text-center bg-black/30 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-white/20">
                <span id="deal-hours" class="text-xl sm:text-2xl font-black tracking-tight">08</span>
                <span class="block text-[9px] uppercase tracking-wider font-bold text-orange-200">Hours</span>
              </div>
              <span class="text-2xl font-bold">:</span>
              <div class="text-center bg-black/30 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-white/20">
                <span id="deal-mins" class="text-xl sm:text-2xl font-black tracking-tight">42</span>
                <span class="block text-[9px] uppercase tracking-wider font-bold text-orange-200">Mins</span>
              </div>
              <span class="text-2xl font-bold">:</span>
              <div class="text-center bg-black/30 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-white/20">
                <span id="deal-secs" class="text-xl sm:text-2xl font-black tracking-tight">15</span>
                <span class="block text-[9px] uppercase tracking-wider font-bold text-orange-200">Secs</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${dealsProducts.map((p) => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- TRENDING THIS WEEK -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900">Trending This Week</h2>
            <p class="text-xs text-slate-500">Most ordered items with verified 5-star customer ratings</p>
          </div>
          <a href="/products?sort=rating" data-link class="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>View All</span>
            ${icon("chevronRight", "w-4 h-4")}
          </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${trendingProducts.map((p) => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- COMPUTERS & WORKSTATIONS -->
      ${computersProducts.length > 0 ? `
        <section class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                ${icon("monitor", "w-5 h-5")}
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900">Computers & Workstations</h2>
                <p class="text-xs text-slate-500">UltraBook laptops, 4K monitors, and professional computing gear</p>
              </div>
            </div>
            <a href="/category/computers" data-link class="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              <span>Shop Computers</span>
              ${icon("chevronRight", "w-4 h-4")}
            </a>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${computersProducts.map((p) => renderProductCard(p)).join("")}
          </div>
        </section>
      ` : ""}

      <!-- TOOLS & HARDWARE ESSENTIALS -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              ${icon("wrench", "w-5 h-5")}
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">Tools & Hardware</h2>
              <p class="text-xs text-slate-500">Power tools, spanner sets, strippers, and organizer systems</p>
            </div>
          </div>
          <a href="/category/tools" data-link class="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>Shop Tools</span>
            ${icon("chevronRight", "w-4 h-4")}
          </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${toolsProducts.map((p) => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- ELECTRICAL ESSENTIALS -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              ${icon("zap", "w-5 h-5")}
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">Electrical Essentials</h2>
              <p class="text-xs text-slate-500">Touch switchboards, work flood lights, multimeters, and high-power plugs</p>
            </div>
          </div>
          <a href="/category/electrical" data-link class="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>Shop Electrical</span>
            ${icon("chevronRight", "w-4 h-4")}
          </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${electricalProducts.map((p) => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- PLUMBING PICKS -->
      <section class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              ${icon("droplets", "w-5 h-5")}
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">Plumbing Picks</h2>
              <p class="text-xs text-slate-500">Pressure valves, luxury bath heads, and heavy UPVC elbows</p>
            </div>
          </div>
          <a href="/category/plumbing" data-link class="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>Shop Plumbing</span>
            ${icon("chevronRight", "w-4 h-4")}
          </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${plumbingProducts.map((p) => renderProductCard(p)).join("")}
        </div>
      </section>

      ${recentProducts.length > 0 ? `
        <!-- RECENTLY VIEWED -->
        <section class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">Recently Viewed</h2>
              <p class="text-xs text-slate-500">Continue where you left off</p>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${recentProducts.map((p) => renderProductCard(p)).join("")}
          </div>
        </section>
      ` : ""}

    </div>
  `;
}
export function attachHomePageEvents() {
  attachProductCardListeners();
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".carousel-dot");
  const totalSlides = slides.length;
  const showSlide = (idx) => {
    currentSlide = (idx + totalSlides) % totalSlides;
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.remove("opacity-0", "pointer-events-none");
        slide.classList.add("opacity-100");
      } else {
        slide.classList.add("opacity-0", "pointer-events-none");
        slide.classList.remove("opacity-100");
      }
    });
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.remove("bg-white/40");
        dot.classList.add("bg-white");
      } else {
        dot.classList.add("bg-white/40");
        dot.classList.remove("bg-white");
      }
    });
  };
  const nextBtn = document.getElementById("carousel-next");
  const prevBtn = document.getElementById("carousel-prev");
  if (nextBtn) {
    nextBtn.onclick = () => {
      showSlide(currentSlide + 1);
      resetAutoplay();
    };
  }
  if (prevBtn) {
    prevBtn.onclick = () => {
      showSlide(currentSlide - 1);
      resetAutoplay();
    };
  }
  dots.forEach((dot) => {
    dot.onclick = () => {
      const idx = parseInt(dot.getAttribute("data-target") || "0", 10);
      showSlide(idx);
      resetAutoplay();
    };
  });
  const startAutoplay = () => {
    carouselTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6e3);
  };
  const resetAutoplay = () => {
    clearInterval(carouselTimer);
    startAutoplay();
  };
  startAutoplay();
  const hoursEl = document.getElementById("deal-hours");
  const minsEl = document.getElementById("deal-mins");
  const secsEl = document.getElementById("deal-secs");
  if (hoursEl && minsEl && secsEl) {
    let totalSecs = 8 * 3600 + 42 * 60 + 15;
    const countdownInterval = setInterval(() => {
      totalSecs--;
      if (totalSecs <= 0) {
        clearInterval(countdownInterval);
        return;
      }
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor(totalSecs % 3600 / 60);
      const s = totalSecs % 60;
      hoursEl.textContent = String(h).padStart(2, "0");
      minsEl.textContent = String(m).padStart(2, "0");
      secsEl.textContent = String(s).padStart(2, "0");
    }, 1e3);
  }
}
