import { spawn } from "node:child_process";

const workerName = process.argv[2];

if (!workerName) {
	console.error("Usage: pnpm worker <worker-name>");
	process.exit(1);
}

const workerPath = `src/background/workers/${workerName}.worker.ts`;

const child = spawn("tsx", [workerPath], {
	stdio: "inherit",
	shell: true,
});

child.on("exit", (code) => {
	process.exit(code ?? 1);
});
