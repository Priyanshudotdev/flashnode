import { type Job, Worker } from "bullmq";
import { dlq } from "../queues/dead-letter.queue.js";
import { connection } from "../redis-connections.js";
import {
	paymentConfirmationEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../services/email.service.js";

const emailWorker = new Worker(
	"email-tasks",
	async (job: Job) => {
		try {
			const { name, email } = job.data;
			console.log(`Processing job ${job.id}`);

			let response = null;
			switch (name) {
				case "PASSWORD_RESET_EMAIL":
					response = await sendPasswordResetEmail(email, "resetURL");
					break;
				case "PAYMENT_CONFIRMATION_EMAIL":
					response = await paymentConfirmationEmail(email, "orderId", 300);
					break;
				case "VERFICATION_EMAIL":
					response = await sendVerificationEmail(email, "verficationUrl");
					break;
				default:
					response = await sendWelcomeEmail(email);
			}

			console.log(response);
		} catch {
			throw new Error(`Invalid data`);
		}
	},
	{
		connection,
		concurrency: 50,
		limiter: {
			max: 5,
			duration: 10000,
		},
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
