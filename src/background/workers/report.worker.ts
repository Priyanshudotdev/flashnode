import { type Job, Worker } from "bullmq";
import { dlq } from "../queues/dead-letter.queue.js";
import { connection } from "../redis-connections.js";

const reportWorker = new Worker(
	"report-tasks",
	async (job: Job) => {
		console.log(`scheduled job done ${job.id} - ${job.data.name}`);
	},
	{ connection },
);

reportWorker.on("completed", (job) => {
	console.log(`Job ${job?.id} is completed`);
});

reportWorker.on("failed", async (job, error) => {
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
