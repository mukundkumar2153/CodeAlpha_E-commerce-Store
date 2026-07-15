import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @route   POST /api/orders/razorpay/create
// Creates a Razorpay order for the given amount (in INR)
router.post("/razorpay/create", protect, async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders
// Creates order after cart checkout. If paymentMethod is razorpay, verifies signature first.
router.post("/", protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentResult, itemsPrice, shippingPrice, taxPrice, totalPrice } =
      req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    if (paymentMethod === "razorpay") {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentResult || {};
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: "Missing payment verification details" });
      }

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    }

    // Verify stock and decrement
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || "razorpay",
      paymentResult: paymentMethod === "razorpay" ? paymentResult : undefined,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paymentMethod === "razorpay",
      paidAt: paymentMethod === "razorpay" ? new Date() : undefined,
      status: "processing",
    });

    // Clear the user's cart after successful order
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/my
router.get("/my", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
router.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// ----- ADMIN ROUTES -----

// @route   GET /api/orders  (admin) - all orders
router.get("/", protect, admin, async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/status  (admin)
router.put("/:id/status", protect, admin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    const updated = await order.save();
    res.json({ order: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
