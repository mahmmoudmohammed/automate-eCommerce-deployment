const crypto = require("crypto");

const createAuthMiddleware = (tokenRepo) => async (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!bearerToken) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  // Token format: "<userId>|<raw_token>"
  const parts = bearerToken.split("|");
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const [userId] = parts;
  const hashedToken = crypto
    .createHash("sha256")
    .update(bearerToken)
    .digest("hex");

  try {
    const tokenRecord = await tokenRepo.findValidToken(hashedToken, userId);

    if (!tokenRecord) {
      return res.status(401).json({ message: "Unauthenticated." });
    }

    // Separate user information from token hash
    req.user = {
      id: tokenRecord.id, // This is users.id due to the JOIN alias in TokenRepository
      name: tokenRecord.name,
      email: tokenRecord.email,
    };
    req.tokenHash = hashedToken; // Save hash for logout without recalculating
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = createAuthMiddleware;
