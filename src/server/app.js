import {
  ansiColorFormatter,
  configure,
  getConsoleSink,
  getLogger,
} from "logtape";
import { changeGameOffset } from "@/server/logic.js";
import { getGames } from "@/server/chess-api.js";
import { effect } from "preact-signals-core";
import { store } from "@/server/store.js";
import { app, sseManager } from "@/server/hono.jsx";
import { APP_NAME } from "@/consts.js";
import { env } from "@/server/utils.js";

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

changeGameOffset(0, await getGames());

effect(() => {
  sseManager.broadcast(JSON.stringify(store.clientify()));
});

Deno.serve({
  onListen: (addr) =>
    logger.info("listening on port {port}", { port: addr.port }),
}, app.fetch);
