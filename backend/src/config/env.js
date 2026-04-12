const keys = require("../../keys");

const required = [
  "pgUser",
  "pgHost",
  "pgDatabase",
  "pgPassword",
  "pgPort",
  "redisHost",
  "redisPort",
];

// Reusing the existing keys.js but we validate here on startup
for (const key of required) {
  if (!keys[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  pgUser: keys.pgUser,
  pgHost: keys.pgHost,
  pgDatabase: keys.pgDatabase,
  pgPassword: keys.pgPassword,
  pgPort: Number(keys.pgPort),
  redisHost: keys.redisHost,
  redisPort: Number(keys.redisPort),
};
