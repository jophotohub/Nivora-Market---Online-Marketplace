import { apiRequest, getToken, removeToken } from "./api.js";
const state = {
  user: null,
  cartCount: 0,
  wishlistIds: /* @__PURE__ */ new Set(),
  unreadNotifs: 0
};
const listeners = /* @__PURE__ */ new Set();
export function subscribeState(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function notify() {
  listeners.forEach((fn) => fn());
}
export function getState() {
  return state;
}
export async function initAppState() {
  const token = getToken();
  if (token) {
    const res = await apiRequest("/auth/me");
    if (res.success && res.user) {
      state.user = res.user;
    } else {
      removeToken();
      state.user = null;
    }
  }
  await refreshCartCount();
  await refreshWishlist();
  if (state.user) {
    await refreshNotifications();
  }
  notify();
}
export async function refreshCartCount() {
  const res = await apiRequest("/cart");
  if (res.success) {
    state.cartCount = res.itemCount || 0;
    notify();
  }
}
export async function refreshWishlist() {
  const res = await apiRequest("/wishlist");
  if (res.success && res.productIds) {
    state.wishlistIds = new Set(res.productIds);
    notify();
  }
}
export async function refreshNotifications() {
  if (!state.user) return;
  const res = await apiRequest("/notifications");
  if (res.success) {
    state.unreadNotifs = res.unreadCount || 0;
    notify();
  }
}
export function setUser(user) {
  state.user = user;
  if (!user) {
    state.cartCount = 0;
    state.wishlistIds.clear();
    state.unreadNotifs = 0;
  }
  notify();
}
export function isWishlisted(productId) {
  return state.wishlistIds.has(productId);
}
