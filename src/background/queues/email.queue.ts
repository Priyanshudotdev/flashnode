import { createNodeRedisClient, Queue } from "bullmq";
import { createRedisClient } from "../../config/redis.js";

const redisClient = await createRedisClient();
export const connection = createNodeRedisClient(redisClient);
// Queue placeholder file for email queue
export const emailQueue = new Queue("email-tasks", { connection });
