import { env, now } from "@/server/utils.js";
import { API_THROTTLE_TTL, APP_NAME } from "@/consts.js";
import * as v from "valibot";
import { createFetch, createSchema } from "better-fetch";
import { getLogger } from "logtape";

// const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));

const logger = getLogger([APP_NAME, "chess-api"]);

const cache = {
  games: [],

  timeStart: 0,
  timeEnd: -API_THROTTLE_TTL,

  etag: "",
  lastModified: "",
};

const userSchema = v.object({
  rating: v.number(),
  result: v.string(),
  username: v.string(),
});

const gameSchema = v.object({
  end_time: v.number(),
  white: userSchema,
  black: userSchema,
  tournament: v.optional(v.string()),
});

const responseSchema = v.object({
  games: v.array(gameSchema),
});

const chessSchema = createSchema({
  "/:year/:month": {
    output: responseSchema,
  },
});

const $fetch = createFetch({
  baseURL: `https://api.chess.com/pub/player/${env.playerName}/games`,
  headers: { "User-Agent": `${APP_NAME}/0.1.2 (contact: ${env.devEmail})` },
  schema: chessSchema,
  catchAllError: true,
  onRequest: (ctx) => {
    cache.timeStart = now();
    ctx.headers.set("If-None-Match", cache.etag);
    ctx.headers.set("If-Modified-Since", cache.lastModified);
  },
  onResponse: (ctx) => {
    cache.timeEnd = now();
    cache.etag = ctx.response.headers.get("ETag");
    cache.lastModified = ctx.response.headers.get("Last-Modified");

    logger.info("request to ChessAPI complete in {dur} ms", {
      dur: Math.floor(cache.timeEnd - cache.timeStart),
    });
  },
});

function getCachedGames(error) {
  logger.warn(
    `using cachedGames cause of ${error ? "ChessAPI {*}" : "API_THROTTLE_TTL"}`,
    { error },
  );
  return Promise.resolve(cache.games);
}

export async function getGames(archiveDateTouple) {
  if (now() - cache.timeEnd <= API_THROTTLE_TTL) {
    return getCachedGames();
  }

  logger.debug("request /{year}/{month}", archiveDateTouple);

  const { data, error } = await $fetch("/:year/:month", {
    params: archiveDateTouple,
  });
  const sc = structuredClone(cache);
  Reflect.deleteProperty(sc, "games");
  logger.debug(sc);

  return error ? getCachedGames(error) : (cache.games = data.games);
}
