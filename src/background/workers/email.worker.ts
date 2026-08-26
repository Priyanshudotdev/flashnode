import { createNodeRedisClient, type Job, Worker } from "bullmq";
import { createRedisClient } from "../../config/redis.js";
import { connection } from "../queues/email.queue.js";
import { sendWelcomeEmail } from "../services/email.service.js";

const workerRedisClient = await createRedisClient();
export const workerConnection = createNodeRedisClient(workerRedisClient);

const emailWorker = new Worker(
	"email-tasks",
	async (job: Job) => {
		const { email } = job.data;
		console.log(`Processing job ${job.id}`);
		await sendWelcomeEmail(email);
	},
	{
		connection,
	},
);

emailWorker.on("completed", (job) => {
	console.log(`Job ${job?.id} is completed`);
});

emailWorker.on("failed", (job, error) => {
	console.error(`Job ${job?.id} failed with error: ${error.message}`);
});

emailWorker.on("stalled", async () => {
	await emailWorker.close();
	process.exit(0);
});
