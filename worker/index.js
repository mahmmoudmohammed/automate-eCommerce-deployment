const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

const sub = redisClient.duplicate();

sub.on("error", (err) => console.error("Redis Subscriber Error", err));
redisClient.on("error", (err) => console.error("Redis Client Error", err));

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

(async () => {
  await redisClient.connect();
  await sub.connect();

  sub.subscribe("insert", (message) => {
    redisClient.hSet("values", message, fib(parseInt(message)));
  });
})();
