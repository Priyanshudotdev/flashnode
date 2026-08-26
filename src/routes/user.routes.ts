import { Router } from "express";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { createUser, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/", rateLimiter("rate-limit:POST:/users:", 5, 60), createUser);
router.get("/:id", rateLimiter("rate-limit:GET:/users:id:", 60, 60), getUserById);
router.put("/:id", rateLimiter("rate-limit:PUT:/users:id:", 20, 60), updateUser);
router.delete("/:id", rateLimiter("rate-limit:DELETE:/users:id:", 10, 60), deleteUser);

export default router;
