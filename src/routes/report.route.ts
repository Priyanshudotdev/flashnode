import { Router } from "express";
import { createJobScheduler } from "../controllers/report.controller.js";

const router = Router();

router.get("/", createJobScheduler);

export default router;
