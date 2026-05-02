const { Pool } = require("pg");
const env = require("./env");

const pgClient = new Pool({
  user: env.pgUser,
  host: env.pgHost,
  database: env.pgDatabase,
  password: env.pgPassword,
  port: env.pgPort,
});

// Explicit error handler to prevent unhandled rejections crashing Node
pgClient.on("error", (err) => {
  console.error("Unexpected error on idle pg client", err);
  process.exit(-1);
});

module.exports = pgClient;
