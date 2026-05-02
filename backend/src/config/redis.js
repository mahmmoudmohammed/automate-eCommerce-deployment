const redis = require("redis");
const env = require("./env");

const redisClient = redis.createClient({
  url: `redis://${env.redisHost}:${env.redisPort}`,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

const redisPublisher = redisClient.duplicate();

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisPublisher.on("error", (err) => console.error("Redis Publisher Error", err));

module.exports = {
  redisClient,
  redisPublisher,
};
