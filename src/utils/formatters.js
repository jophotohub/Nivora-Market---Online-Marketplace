export function formatPrice(amount) {
  if (amount === void 0 || amount === null || isNaN(amount)) return "\u20B90";
  return "\u20B9" + amount.toLocaleString("en-IN");
}
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
export function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
export function truncate(text, length) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}
