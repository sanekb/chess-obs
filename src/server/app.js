import {
  ansiColorFormatter,
  configure,
  getConsoleSink,
  getLogger,
} from "logtape";
import { setupStore } from "@/server/logic.js";
import { effect } from "preact-signals-core";
import { store } from "@/server/store.js";
import { app, getGamesByTournDate, sseManager } from "@/server/hono.jsx";
import { APP_NAME } from "@/consts.js";
import { env, today } from "@/server/utils.js";

await configure({
  sinks: {
    console: getConsoleSink({ formatter: ansiColorFormatter }),
  },
  loggers: [
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "warning",
    },
    {
      category: [APP_NAME],
      sinks: ["console"],
      lowestLevel: (env.appEnv === "dev" && "debug") ||
        (env.appEnv === "prod" && "info") || "debug",
    },
  ],
});

const logger = getLogger([APP_NAME, "app"]);

await setupStore(today(), getGamesByTournDate);

Deno.cron("setup Titled Tuesday", "0 15 * * TUE", async () => {
  await setupStore(today(), getGamesByTournDate);
});
Deno.cron("setup Titled Thursday", "19 20 * * *", async () => {
  await setupStore(today(), getGamesByTournDate);
});

effect(() => {
  sseManager.broadcast(JSON.stringify(store.clientify()));
});

Deno.serve({
  onListen: (addr) => logger.info`Listening on ${addr.hostname}:${addr.port}`,
}, app.fetch);
