import { Queue } from "bullmq";
import { connection } from "../redis-connections.js";

export const dlq = new Queue("dlq-tasks", { connection });
