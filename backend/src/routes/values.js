const express = require("express");

const createValuesRoutes = (pgClient, redisClient, redisPublisher) => {
  const router = express.Router();

  router.get("/all", async (req, res) => {
    try {
      const values = await pgClient.query("SELECT * from fib_values");
      res.send(values.rows);
    } catch (err) {
      console.error("GET /values/all error:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

  router.get("/current", async (req, res) => {
    try {
      const values = await redisClient.hGetAll("values");
      res.send(values);
    } catch (err) {
      console.error("GET /values/current error:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

  router.post("/", async (req, res) => {
    const index = parseInt(req.body.index, 10);

    // validate: must be a finite integer
    if (!Number.isFinite(index)) {
      return res.status(422).json({ message: "Index must be a valid number." });
    }

    if (index > 40) {
      return res.status(422).json({ message: "Index too high." });
    }

    try {
      await redisClient.hSet("values", index, "Nothing yet!");
      await redisPublisher.publish("insert", String(index));
      await pgClient.query("INSERT INTO fib_values(number) VALUES($1)", [
        index,
      ]);
      res.send({ working: true });
    } catch (err) {
      console.error("POST /values error:", err);
      res.status(500).json({ message: "Server error." });
    }
  });

  return router;
};

module.exports = createValuesRoutes;
