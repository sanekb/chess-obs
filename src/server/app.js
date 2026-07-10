import {
  ansiColorFormatter,
  configure,
  getConsoleSink,
  getLogger,
} from "logtape";
import { createChessApi } from "@/server/chess-api.js";
import { createLogic } from "@/server/logic.js";
import { createHono } from "@/server/hono.jsx";
import { APP_NAME } from "@/consts.js";
import { env } from "@/server/utils.js";
import { store } from "@/server/store.js";

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

const chessApi = createChessApi({
  playerName: env.playerName,
  devEmail: env.devEmail,
});
const logic = createLogic({ store, chessApi });
const hono = createHono({ store, logic, chessApi });

Deno.cron("Prepare store for Tourn", "0 15,16 * * TUE,THU", async () => {
  await logic.prepareStore();
});

Deno.serve({
  onListen: (addr) => logger.info`Listening on ${addr.hostname}:${addr.port}`,
}, hono.fetch);
