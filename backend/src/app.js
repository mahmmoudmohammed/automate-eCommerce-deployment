const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

// Dependencies
const pgClient = require("./config/db");
const { redisClient, redisPublisher } = require("./config/redis");

// Repositories
const UserRepository = require("./repositories/userRepository");
const TokenRepository = require("./repositories/tokenRepository");
const userRepo = new UserRepository(pgClient);
const tokenRepo = new TokenRepository(pgClient);

// Services
const AuthService = require("./services/authService");
const authService = new AuthService(userRepo, tokenRepo);

// Middleware
const createAuthMiddleware = require("./middleware/authenticate");
const authMiddleware = createAuthMiddleware(tokenRepo);

// Routes
const createAuthRoutes = require("./routes/auth");
const createValuesRoutes = require("./routes/values");

const app = express();

// Global Middlewares
app.use(helmet());
// Optional: restrict CORS from process.env.CORS_ORIGIN if desired
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN }
  : {};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Set up routes
const authRoutes = createAuthRoutes(authService, authMiddleware);
const valuesRoutes = createValuesRoutes(pgClient, redisClient, redisPublisher);

app.use("/", authRoutes);
app.use("/values", valuesRoutes);

app.get("/", (req, res) => {
  res.send("Hi");
});

module.exports = app;
