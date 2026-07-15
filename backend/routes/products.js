import express from "express";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/products
// Supports: ?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (keyword) {
      filter.$text = { $search: keyword };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/featured
router.get("/featured", async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "reviews.user",
      "name"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products/:id/reviews
router.post("/:id/reviews", protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (error) {
    next(error);
  }
});

// ----- ADMIN ROUTES -----

// @route   POST /api/products  (admin)
router.post("/", protect, admin, async (req, res, next) => {
  try {
    const { name, description, price, category, brand, images, stock, discountPrice, isFeatured } =
      req.body;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      discountPrice,
      category,
      brand,
      images,
      stock,
      isFeatured,
    });

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/products/:id  (admin)
router.put("/:id", protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const fields = [
      "name",
      "description",
      "price",
      "discountPrice",
      "category",
      "brand",
      "images",
      "stock",
      "isFeatured",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    if (req.body.name) {
      product.slug = req.body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const updated = await product.save();
    res.json({ product: updated });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/products/:id  (admin)
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    next(error);
  }
});

export default router;
