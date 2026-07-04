import { env } from "@/server/utils.js";
import { API_THROTTLE_TTL, APP_NAME } from "@/consts.js";
import * as v from "valibot";
import { createFetch, createSchema } from "better-fetch";
import { getLogger } from "logtape";

const mock = JSON.parse(Deno.readTextFileSync("./src/mock2.json"));

const logger = getLogger([APP_NAME, "chess-api"]);

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

const cache = { games: [], time: -Infinity, etag: "", lastModified: "" };

const api = createFetch({
  baseURL: `https://api.chess.com/pub/player/${env.playerName}/games`,
  headers: { "User-Agent": `${APP_NAME}/0.1.2 (contact: ${env.devEmail})` },
  schema: chessSchema,
  catchAllError: true,
  onRequest: (ctx) => {
    ctx.headers.set("If-None-Match", cache.etag);
    ctx.headers.set("If-Modified-Since", cache.lastModified);
  },
  onResponse: (ctx) => {
    cache.etag = ctx.response.headers.get("ETag");
    cache.lastModified = ctx.response.headers.get("Last-Modified");
  },
});

function getCachedGames(error) {
  if (error) {
    logger.warn(
      "using cachedGames cause of chess.com api error: {*}",
      { error },
    );
  }
  return Promise.resolve(cache.games);
}

export async function getGames(chessArchUrlDate, refresh = true) {
  if (!refresh || performance.now() - cache.time < API_THROTTLE_TTL) {
    return getCachedGames();
  }

  const start = performance.now();
  const { year, month } = chessArchUrlDate;
  const { data, error } = await api("/:year/:month", {
    params: { year, month },
  });
  const end = performance.now();

  if (error) {
    return getCachedGames(error);
  }

  const { games } = data;
  cache.games = games;
  cache.time = end;

  logger.info(
    "requests chess.com api success in {duration} ms - got {length} games",
    {
      duration: Math.floor(end - start),
      length: games.length,
    },
  );

  return games;
}
