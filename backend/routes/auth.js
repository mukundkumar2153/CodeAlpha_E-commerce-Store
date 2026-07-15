import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await User.create({ name, email, password });

      res.status(201).json({
        user: user.toSafeObject(),
        token: generateToken(user._id, user.role),
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          user: user.toSafeObject(),
          token: generateToken(user._id, user.role),
        });
      }

      res.status(401).json({ message: "Invalid email or password" });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/profile
router.get("/profile", protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
});

// @route   PUT /api/auth/profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    const updated = await user.save();
    res.json({ user: updated.toSafeObject() });
  } catch (error) {
    next(error);
  }
});

export default router;
