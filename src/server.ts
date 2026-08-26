import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import express from "express";
import { emailQueue } from "./background/queues/email.queue.js";
import { connectToDB } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
	queues: [new BullMQAdapter(emailQueue)],
	serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

app.use(express.json());

app.get("/", (req, res) => {
	res.json({ msg: "working", ip: req.ip });
});

app.use("/users", userRoutes);

connectToDB().then(() => {
	app.listen(8080, () => {
		console.log("Server listing on http://localhost:8080/");
	});
});
