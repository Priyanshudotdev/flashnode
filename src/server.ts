import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import express from "express";
import { dlq } from "./background/queues/dead-letter.queue.js";
import { emailQueue } from "./background/queues/email.queue.js";
import { reportQueue } from "./background/queues/report.queue.js";
import { connectToDB } from "./config/db.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
	queues: [
		new BullMQAdapter(emailQueue),
		new BullMQAdapter(dlq),
		new BullMQAdapter(reportQueue),
	],
	serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

app.use(express.json());

app.get("/", (req, res) => {
	res.json({ msg: "working", ip: req.ip });
});

app.use("/users", userRoutes);
app.use("/reports", reportRoutes);

connectToDB().then(() => {
	app.listen(8080, () => {
		console.log("Server listing on http://localhost:8080/");
	});
});
