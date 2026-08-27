import { Queue } from "bullmq";
import { connection } from "../redis-connections.js";

export const reportQueue = new Queue("report-tasks", { connection });
