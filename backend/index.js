const keys = require("./keys");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

// Initialize DB tables
pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error("values table error:", err));

  client
    .query(
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    )
    .catch((err) => console.error("users table error:", err));

  client
    .query(
      `CREATE TABLE IF NOT EXISTS personal_access_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    )
    .catch((err) => console.error("tokens table error:", err));
});

// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

(async () => {
  await redisClient.connect();
  await redisPublisher.connect();
})();

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!bearerToken) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  // Token format: "<id>|<raw_token>"
  const [tokenId, rawToken] = bearerToken.split("|");
  if (!tokenId || !rawToken) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(bearerToken)
    .digest("hex");

  try {
    const result = await pgClient.query(
      `SELECT pat.*, u.id as user_id, u.name, u.email, u.created_at as user_created_at, u.updated_at as user_updated_at
       FROM personal_access_tokens pat
       JOIN users u ON u.id = pat.user_id
       WHERE pat.token = $1`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Unauthenticated." });
    }

    req.user = result.rows[0];
    req.tokenRecord = result.rows[0];
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// POST /register
app.post("/register", async (req, res) => {
  const { name, email, password, password_confirmation } = req.body;

  if (!name || !email || !password || !password_confirmation) {
    return res.status(422).json({ message: "All fields are required." });
  }

  if (password !== password_confirmation) {
    return res
      .status(422)
      .json({ message: "Password confirmation does not match." });
  }

  try {
    // Check if email already taken
    const existing = await pgClient.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(422).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pgClient.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

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
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .json({ message: "Email and password are required." });
  }

  try {
    const result = await pgClient.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate token: "<id>|<random_hex>"
    const rawToken = crypto.randomBytes(20).toString("hex");
    const tokenId = user.id;
    const plainTextToken = `${tokenId}|${rawToken}`;
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainTextToken)
      .digest("hex");

    await pgClient.query(
      "INSERT INTO personal_access_tokens (user_id, token) VALUES ($1, $2)",
      [user.id, hashedToken]
    );

    // Update updated_at on login
    await pgClient.query("UPDATE users SET updated_at = NOW() WHERE id = $1", [
      user.id,
    ]);

    res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token: plainTextToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /logout  (requires Bearer token)
app.post("/logout", authenticate, async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const bearerToken = authHeader.slice(7);
    const hashedToken = crypto
      .createHash("sha256")
      .update(bearerToken)
      .digest("hex");

    await pgClient.query(
      "DELETE FROM personal_access_tokens WHERE token = $1",
      [hashedToken]
    );

    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ─── Existing Routes ──────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  const values = await redisClient.hGetAll("values");
  res.send(values);
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  await redisClient.hSet("values", index, "Nothing yet!");
  await redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Listening on port 5000");
});
