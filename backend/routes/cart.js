import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/cart
router.get("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json({ cart: user.cart });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/cart  { productId, quantity }
router.post("/", protect, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    await user.populate("cart.product");
    res.status(201).json({ cart: user.cart });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/cart/:productId  { quantity }
router.put("/:productId", protect, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find((i) => i.product.toString() === req.params.productId);

    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await user.save();
    await user.populate("cart.product");
    res.json({ cart: user.cart });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart/:productId
router.delete("/:productId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    await user.save();
    await user.populate("cart.product");
    res.json({ cart: user.cart });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart
router.delete("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ cart: [] });
  } catch (error) {
    next(error);
  }
});

export default router;
