const app = require("./src/app");
const db = require("./src/config/db");
const { redisClient, redisPublisher } = require("./src/config/redis");
const runMigrations = require("./src/db/migrate");

(async () => {
  try {
    // Check DB health
    await db.query("SELECT 1");
    // Run migrations once at startup
    await runMigrations(db);

    // Connect to Redis
    await redisClient.connect();
    await redisPublisher.connect();

    app.listen(5000, () => {
      console.log("Listening on port 5000");
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();