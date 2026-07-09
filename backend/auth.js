const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// In a real deployment this must come from an environment variable.
// Generated once per server start so tokens don't leak across restarts of a shared dev box.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Please sign in to continue." });
  next();
}

module.exports = { signToken, authMiddleware, requireAuth, JWT_SECRET };
