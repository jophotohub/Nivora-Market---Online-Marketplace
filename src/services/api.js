const API_BASE = "/api";
export function getToken() {
  return localStorage.getItem("nivora_token");
}
export function setToken(token) {
  localStorage.setItem("nivora_token", token);
}
export function removeToken() {
  localStorage.removeItem("nivora_token");
}
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...options.headers || {}
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
        removeToken();
        window.dispatchEvent(new CustomEvent("nivora:auth-expired"));
      }
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`
      };
    }
    return data;
  } catch (err) {
    console.error("API Error:", err);
    return {
      success: false,
      message: "Network connection issue. Please check your connection."
    };
  }
}
