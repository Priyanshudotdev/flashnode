import { type Job, Worker } from "bullmq";
import { connection } from "../redis-connections.js";

const _dlqWorker = new Worker(
	"dlq-tasks",
	async (job: Job) => {
		const data = job.data;
		console.log(data);
	},
	{
		connection,
	},
);
