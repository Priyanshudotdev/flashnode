import { Queue } from "bullmq";
import { connection } from "../redis-connections.js";

// Queue placeholder file for email queue
export const emailQueue = new Queue("email-tasks", { connection });
