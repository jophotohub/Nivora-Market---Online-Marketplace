import { getDb } from "../db/store.js";
export async function getCategories(req, res) {
  try {
    const db = getDb();
    const categoriesWithCount = db.categories.map((cat) => {
      const count = db.products.filter((p) => {
        const pSlug = (p.categorySlug || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase().replace(/\s+/g, "-");
        return pSlug === cat.slug || pCat === cat.slug;
      }).length;
      return {
        ...cat,
        productCount: count
      };
    });
    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    const db = getDb();
    const cleanSlug = (slug || "").toLowerCase().trim();
    const category = db.categories.find((c) => c.slug.toLowerCase() === cleanSlug);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    const products = db.products.filter((p) => {
      const pSlug = (p.categorySlug || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase().replace(/\s+/g, "-");
      return pSlug === category.slug || pCat === category.slug;
    });
    res.json({
      success: true,
      category,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
