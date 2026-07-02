import { env } from "@/server/env.js";
import { API_THROTTLE_TTL, APP_NAME } from "@/consts.js";
import * as v from "valibot";
import { createFetch, createSchema } from "better-fetch";
import { getLogger } from "logtape";

const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));

const logger = getLogger([APP_NAME, "chess-api"]);

const gameSchema = v.object({
  id: v.number(),
  user1Rating: v.number(),
  user2Rating: v.number(),
  user1Result: v.number(),
  user2Result: v.number(),
  user1: v.object({ username: v.string() }),
  user2: v.object({ username: v.string() }),
});

const gamesSchema = v.object({
  data: v.array(gameSchema),
});

const chessSchema = createSchema({
  "/callback/games/extended-archive": {
    method: "get",
    query: v.object({
      locale: v.string(),
      username: v.string(),
      page: v.number(),
    }),
    output: gamesSchema,
  },
});

const api = createFetch({
  baseURL: "https://www.chess.com",
  headers: { "User-Agent": `${APP_NAME}/0.1.2 (contact: ${env.devEmail})` },
  schema: chessSchema,
  catchAllError: true,
});

const cache = { games: mock.data, time: +Infinity };

function getCachedGames(error) {
  if (error) {
    logger.warn(
      "using cachedGames cause of chess.com api error: {*}",
      { error },
    );
  }
  return Promise.resolve(cache.games);
}

export async function getGames(refresh = true) {
  if (!refresh || performance.now() - cache.time < API_THROTTLE_TTL) {
    return getCachedGames();
  }

  const start = performance.now();
  const { data, error } = await api("/callback/games/extended-archive", {
    query: {
      locale: "en",
      username: env.playerName,
      page: 1,
    },
  });
  const end = performance.now();

  if (error) {
    return getCachedGames(error);
  }

  const games = data.data;
  cache.games = games;
  cache.time = end;

  logger.info("requests chess.com api success in {duration} ms", {
    duration: Math.floor(end - start),
  });

  return games;
}
