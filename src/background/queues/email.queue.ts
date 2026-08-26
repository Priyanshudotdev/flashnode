import { createNodeRedisClient, Queue } from "bullmq";
import { client } from "../../config/redis.js";

export const connection = createNodeRedisClient(await client);
// Queue placeholder file for email queue
export const emailQueue = new Queue('email-tasks', { connection });
