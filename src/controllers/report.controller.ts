import type { Request, Response } from "express";
import { reportQueue } from "../background/queues/report.queue.js";

export const createJobScheduler = async (_req: Request, res: Response) => {
	const firstJob = await reportQueue.upsertJobScheduler(
		"report-tasks",
		{
			pattern: "*/30 * * * * *",
		},
		{
			name: "my-report-job",
			data: { name: "Priyanshu" },
			opts: {
				backoff: 3,
				attempts: 5,
				removeOnFail: 1000,
			},
		},
	);

	console.log(`Job created ${firstJob.id}`);
	return res.status(200).json({
		message: "scheduled reports",
	});
};
