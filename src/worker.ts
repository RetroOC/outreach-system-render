import { buildAppDeps } from "./bootstrap.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const { scheduler } = buildAppDeps(config);

const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 15000);

async function tick() {
  const result = await scheduler.runDue();
  if (result.queued.length > 0) {
    console.log(JSON.stringify({ type: "scheduler_tick", queued: result.queued }));
  }
}

await tick();
setInterval(() => {
  void tick();
}, intervalMs);
