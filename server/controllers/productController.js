import { getDb, saveDb } from "../db/store.js";
export async function getProducts(req, res) {
  try {
    const db = getDb();
    let items = [...db.products];
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isDeal,
      sort,
      page = "1",
      limit = "16"
    } = req.query;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.shortSpec && p.shortSpec.toLowerCase().includes(q)
      );
    }
    if (category && category !== "all") {
      const catLower = category.toLowerCase().trim();
      const catSlug = catLower.replace(/\s+/g, "-");
      const catSpace = catLower.replace(/-/g, " ");
      items = items.filter((p) => {
        const pSlug = (p.categorySlug || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        const pCatSlug = pCat.replace(/\s+/g, "-");
        return (
          pSlug === catLower ||
          pSlug === catSlug ||
          pCat === catLower ||
          pCat === catSpace ||
          pCatSlug === catSlug
        );
      });
    }
    if (brand && brand !== "all") {
      const bLower = brand.toLowerCase();
      items = items.filter((p) => p.brand.toLowerCase() === bLower);
    }
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) items = items.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) items = items.filter((p) => p.price <= max);
    }
    if (rating) {
      const r = Number(rating);
      if (!isNaN(r)) items = items.filter((p) => p.rating >= r);
    }
    if (inStock === "true" || inStock === "1") {
      items = items.filter((p) => p.stock > 0);
    }
    if (isFeatured === "true") {
      items = items.filter((p) => p.isFeatured);
    }
    if (isDeal === "true") {
      items = items.filter((p) => p.isDeal);
    }
    if (sort === "price_asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    } else if (sort === "discount") {
      items.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else {
      items.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
    }
    const totalCount = items.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 16);
    const totalPages = Math.ceil(totalCount / limitNum);
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    const allBrands = Array.from(new Set(db.products.map((p) => p.brand))).filter(Boolean);
    res.json({
      success: true,
      products: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalProducts: totalCount
      },
      availableBrands: allBrands
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const product = db.products.find((p) => p._id === id || p.slug === id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }
    const related = db.products.filter((p) => p.categorySlug === product.categorySlug && p._id !== product._id).slice(0, 4);
    const reviews = db.reviews.filter((r) => r.productId === product._id);
    res.json({
      success: true,
      product,
      related,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getSearchSuggestions(req, res) {
  try {
    const q = (req.query.q || "").toLowerCase().trim();
    if (!q) return res.json({ suggestions: [], categories: [] });
    const db = getDb();
    const matchingProducts = db.products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 6).map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.images && p.images[0] || "/images/products/placeholder.svg",
      category: p.category
    }));
    const matchingCategories = db.categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3).map((c) => ({
      name: c.name,
      slug: c.slug
    }));
    res.json({
      success: true,
      suggestions: matchingProducts,
      categories: matchingCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function addReview(req, res) {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and review comment are required." });
    }
    const db = getDb();
    const product = db.products.find((p) => p._id === id || p.slug === id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    const newReview = {
      _id: `rev-${Date.now()}`,
      productId: product._id,
      userId: req.user?.id || "anonymous",
      userName: req.user?.name || "Verified Buyer",
      rating: Number(rating),
      title: title || "",
      comment: comment.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.reviews.push(newReview);
    const allProdReviews = db.reviews.filter((r) => r.productId === product._id);
    const sum = allProdReviews.reduce((acc, cur) => acc + cur.rating, 0);
    product.rating = Number((sum / allProdReviews.length).toFixed(1));
    product.reviewCount = allProdReviews.length;
    saveDb();
    res.status(201).json({
      success: true,
      message: "Review submitted successfully. Thank you for your feedback!",
      review: newReview,
      productRating: product.rating,
      reviewCount: product.reviewCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
