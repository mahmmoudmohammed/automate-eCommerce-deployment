const express = require("express");
const rateLimit = require("express-rate-limit");
const validator = require("validator");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth endpoints
  message: { message: "Too many requests, please try again later." },
});

const createAuthRoutes = (authService, authMiddleware) => {
  const router = express.Router();

  router.post("/register", authLimiter, async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;

    if (!name || !email || !password || !password_confirmation) {
      return res.status(422).json({ message: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(422).json({ message: "Invalid email format." });
    }

    if (password.length < 8) {
      return res
        .status(422)
        .json({ message: "Password must be at least 8 characters long." });
    }

    if (password !== password_confirmation) {
      return res
        .status(422)
        .json({ message: "Password confirmation does not match." });
    }

    try {
      const user = await authService.register({ name, email, password });
      res.status(201).json({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (err) {
      if (err.message === "EMAIL_TAKEN") {
        return res.status(422).json({ message: "Email already registered." });
      }
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

  router.post("/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(422)
        .json({ message: "Email and password are required." });
    }

    try {
      const result = await authService.login(email, password);
      res.status(200).json({
        data: result.user,
        token: result.token,
      });
    } catch (err) {
      if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

  router.post("/logout", authMiddleware, async (req, res) => {
    try {
      await authService.logout(req.tokenHash);
      res.status(200).json({ message: "Logged out successfully." });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

  return router;
};

module.exports = createAuthRoutes;
