export const FALLBACK_PRODUCT_IMAGE = "/images/products/placeholder.svg";
export function getProductImage(target) {
  if (!target) return FALLBACK_PRODUCT_IMAGE;
  if (typeof target === "string") {
    const trimmed = target.trim();
    return trimmed.length > 0 ? trimmed : FALLBACK_PRODUCT_IMAGE;
  }
  if (Array.isArray(target.images) && target.images.length > 0 && target.images[0]) {
    const trimmed = target.images[0].trim();
    if (trimmed.length > 0) return trimmed;
  }
  if (target.image && typeof target.image === "string") {
    const trimmed = target.image.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return FALLBACK_PRODUCT_IMAGE;
}
export const IMAGE_FALLBACK_ATTR = `onerror="if(!this.dataset.fallbackApplied){this.dataset.fallbackApplied='true';this.src='${FALLBACK_PRODUCT_IMAGE}';}" referrerpolicy="no-referrer"`;
