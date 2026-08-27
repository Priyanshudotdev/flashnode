import { createNodeRedisClient } from "bullmq";
import { client } from "../config/redis.js";

export const connection = createNodeRedisClient(await client);
