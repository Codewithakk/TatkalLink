import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisURL = process.env.REDIS_URL;

const redisClient = createClient({
  url: redisURL,
  socket: {
    connectTimeout: 10000, // 10 seconds timeout
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000) // Retry logic
  }
});

redisClient.on("error", (error) => console.error("❌ Redis Error:", error));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis Cloud");
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error);
  }
})();

export default redisClient;
