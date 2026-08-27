import { type Job, Worker } from "bullmq";
import { dlq } from "../queues/dead-letter.queue.js";
import { connection } from "../redis-connections.js";
import { sendWelcomeEmail } from "../services/email.service.js";

const emailWorker = new Worker(
	"email-tasks",
	async (job: Job) => {
		try {
			const { email } = job.data;
			console.log(`Processing job ${job.id}`);
			await sendWelcomeEmail(email);
		} catch {
			throw new Error(`Invalid data`);
		}
	},
	{
		connection,
	},
);

emailWorker.on("completed", (job) => {
	console.log(`Job ${job?.id} is completed`);
});

emailWorker.on("failed", async (job, error) => {
	if (!job) return;
	console.error(`Job ${job?.id} failed with error: ${error.message}`);

	if (job.opts.attempts && job.opts.attempts >= job.attemptsMade) {
		console.log("adding to dlq");
		await dlq.add("dql-task", {
			originalId: job.id,
			email: job.data.email,
			reason: error.message,
			attempts: job.attemptsMade,
		});
	}
});

emailWorker.on("stalled", async () => {
	await emailWorker.close();
	process.exit(0);
});
