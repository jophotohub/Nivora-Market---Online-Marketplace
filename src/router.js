import { getState } from "./services/state.js";
import { renderHeader, attachHeaderEvents } from "./components/Header.js";
import { renderCategoryBar, attachCategoryBarEvents } from "./components/CategoryBar.js";
import { renderFooter, attachFooterEvents } from "./components/Footer.js";
import { renderHomePage, attachHomePageEvents } from "./pages/HomePage.js";
import { renderProductsPage, attachProductsPageEvents } from "./pages/ProductsPage.js";
import { renderProductDetailPage, attachProductDetailPageEvents } from "./pages/ProductDetailPage.js";
import { renderCartPage, attachCartPageEvents } from "./pages/CartPage.js";
import { renderCheckoutPage, attachCheckoutPageEvents } from "./pages/CheckoutPage.js";
import { renderPaymentProcessingPage, attachPaymentProcessingEvents } from "./pages/PaymentProcessingPage.js";
import { renderOrderSuccessPage } from "./pages/OrderSuccessPage.js";
import { renderOrdersPage, attachOrdersPageEvents } from "./pages/OrdersPage.js";
import { renderOrderTrackingPage } from "./pages/OrderTrackingPage.js";
import { renderWishlistPage, attachWishlistPageEvents } from "./pages/WishlistPage.js";
import { renderProfilePage, attachProfilePageEvents } from "./pages/ProfilePage.js";
import { renderNotificationsPage, attachNotificationsPageEvents } from "./pages/NotificationsPage.js";
import {
  renderLoginPage,
  attachLoginEvents,
  renderRegisterPage,
  attachRegisterEvents,
  renderForgotPasswordPage,
  attachForgotPasswordEvents
} from "./pages/AuthPages.js";
import {
  renderAdminLogin,
  attachAdminLoginEvents,
  renderAdminRegister,
  attachAdminRegisterEvents,
  renderAdminDashboard,
  renderAdminProducts,
  renderAdminOrders,
  renderAdminCategories,
  renderAdminCustomers,
  renderAdminInventory,
  renderAdminReports,
  attachAdminEvents
} from "./pages/AdminPages.js";
import { renderNotFoundPage } from "./pages/NotFoundPage.js";
import { showToast } from "./components/Toast.js";
export function navigate(path) {
  window.history.pushState({}, "", path);
  handleRouting();
}
export async function handleRouting() {
  const path = window.location.pathname;
  const search = window.location.search;
  const queryParams = new URLSearchParams(search);
  const appContainer = document.getElementById("app");
  if (!appContainer) return;
  window.scrollTo({ top: 0, behavior: "instant" });
  const { user } = getState();
  const isPublicAdminPath = path === "/admin/login" || path === "/admin/register";
  const isProtectedAdminPath = path.startsWith("/admin") && !isPublicAdminPath;
  if (isProtectedAdminPath && (!user || user.role !== "admin")) {
    if (user && user.role !== "admin") {
      showToast("Administrator access is required.", "error");
    }
    window.history.replaceState({}, "", "/admin/login");
    renderPage(renderAdminLogin(), attachAdminLoginEvents, false);
    return;
  }
  if (isPublicAdminPath && user && user.role === "admin") {
    window.history.replaceState({}, "", "/admin/dashboard");
    const content = await renderAdminDashboard();
    renderPage(content, () => attachAdminEvents("dashboard"), false);
    return;
  }
  if (path === "/" || path === "") {
    const content = await renderHomePage();
    renderPage(content, attachHomePageEvents, true, void 0);
    return;
  }
  if (path === "/login") {
    renderPage(renderLoginPage(), attachLoginEvents, true);
    return;
  }
  if (path === "/register") {
    renderPage(renderRegisterPage(), attachRegisterEvents, true);
    return;
  }
  if (path === "/forgot-password") {
    renderPage(renderForgotPasswordPage(), attachForgotPasswordEvents, true);
    return;
  }
  if (path === "/products" || path === "/search") {
    const content = await renderProductsPage(queryParams);
    renderPage(content, () => attachProductsPageEvents(queryParams), true, queryParams.get("category") || void 0);
    return;
  }
  if (path.startsWith("/category/")) {
    const slug = path.split("/category/")[1]?.split("/")[0];
    queryParams.set("category", slug);
    const content = await renderProductsPage(queryParams);
    renderPage(content, () => attachProductsPageEvents(queryParams), true, slug);
    return;
  }
  if (path.startsWith("/products/")) {
    const id = path.split("/products/")[1]?.split("/")[0];
    const content = await renderProductDetailPage(id);
    renderPage(content, () => attachProductDetailPageEvents(id), true);
    return;
  }
  if (path === "/cart") {
    const content = await renderCartPage();
    renderPage(content, attachCartPageEvents, true);
    return;
  }
  if (path === "/checkout") {
    const content = await renderCheckoutPage();
    renderPage(content, attachCheckoutPageEvents, true);
    return;
  }
  if (path === "/payment") {
    const content = renderPaymentProcessingPage();
    renderPage(content, attachPaymentProcessingEvents, true);
    return;
  }
  if (path === "/order-success") {
    const orderId = queryParams.get("orderId") || "";
    const content = await renderOrderSuccessPage(orderId);
    renderPage(content, () => {
    }, true);
    return;
  }
  if (path === "/orders") {
    if (!user) {
      navigate("/login");
      return;
    }
    const content = await renderOrdersPage();
    renderPage(content, attachOrdersPageEvents, true);
    return;
  }
  if (path.startsWith("/orders/") && path.endsWith("/tracking")) {
    const id = path.split("/orders/")[1].replace("/tracking", "");
    const content = await renderOrderTrackingPage(id);
    renderPage(content, () => {
    }, true);
    return;
  }
  if (path.startsWith("/orders/")) {
    const id = path.split("/orders/")[1];
    const content = await renderOrderTrackingPage(id);
    renderPage(content, () => {
    }, true);
    return;
  }
  if (path === "/wishlist") {
    const content = await renderWishlistPage();
    renderPage(content, attachWishlistPageEvents, true);
    return;
  }
  if (path === "/profile" || path === "/profile/addresses") {
    const content = await renderProfilePage();
    renderPage(content, attachProfilePageEvents, true);
    return;
  }
  if (path === "/notifications") {
    const content = await renderNotificationsPage();
    renderPage(content, attachNotificationsPageEvents, true);
    return;
  }
  if (path === "/admin/login") {
    renderPage(renderAdminLogin(), attachAdminLoginEvents, false);
    return;
  }
  if (path === "/admin/register") {
    renderPage(renderAdminRegister(), attachAdminRegisterEvents, false);
    return;
  }
  if (path === "/admin" || path === "/admin/dashboard") {
    const content = await renderAdminDashboard();
    renderPage(content, () => attachAdminEvents("dashboard"), false);
    return;
  }
  if (path === "/admin/products") {
    const content = await renderAdminProducts();
    renderPage(content, () => attachAdminEvents("products"), false);
    return;
  }
  if (path === "/admin/categories") {
    const content = await renderAdminCategories();
    renderPage(content, () => attachAdminEvents("categories"), false);
    return;
  }
  if (path === "/admin/orders") {
    const content = await renderAdminOrders();
    renderPage(content, () => attachAdminEvents("orders"), false);
    return;
  }
  if (path === "/admin/customers") {
    const content = await renderAdminCustomers();
    renderPage(content, () => attachAdminEvents("customers"), false);
    return;
  }
  if (path === "/admin/inventory") {
    const content = await renderAdminInventory();
    renderPage(content, () => attachAdminEvents("inventory"), false);
    return;
  }
  if (path === "/admin/reports") {
    const content = await renderAdminReports();
    renderPage(content, () => attachAdminEvents("reports"), false);
    return;
  }
  renderPage(renderNotFoundPage(), () => {
  }, true);
}
function renderPage(pageHtml, attachEventsFn, includeStorefrontChrome = true, activeCategorySlug) {
  const app = document.getElementById("app");
  if (!app) return;
  if (includeStorefrontChrome) {
    app.innerHTML = `
      ${renderHeader()}
      ${renderCategoryBar(activeCategorySlug)}
      <main id="app-content" class="flex-1 w-full">
        ${pageHtml}
      </main>
      ${renderFooter()}
    `;
    attachHeaderEvents();
    attachCategoryBarEvents();
    attachFooterEvents();
  } else {
    app.innerHTML = `
      <main id="app-content" class="flex-1 w-full">
        ${pageHtml}
      </main>
    `;
  }
  attachEventsFn();
  attachLinkInterception();
}
function attachLinkInterception() {
  document.querySelectorAll("a[data-link]").forEach((anchor) => {
    anchor.onclick = (e) => {
      e.preventDefault();
      const href = anchor.getAttribute("href");
      if (href) {
        navigate(href);
      }
    };
  });
}
