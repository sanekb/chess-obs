import { now, sep } from "@/server/utils.js";
import { plugin304 } from "@/server/plugin304.js";
import { API_THROTTLE_TTL, APP_NAME } from "@/consts.js";
import * as v from "valibot";
import { createFetch, createSchema } from "better-fetch";
import { getLogger } from "logtape";

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
const gamesSchema = v.object({
  games: v.array(gameSchema),
});

export function createChessApi({ playerName, devEmail }) {
  const chessSchema = createSchema({
    "/games/:year/:month": {
      output: gamesSchema,
    },
  });

  const $fetch = createFetch({
    baseURL: `https://api.chess.com/pub/player/${playerName}`,
    headers: { "User-Agent": `${APP_NAME}/1.3 (contact: ${devEmail})` },
    schema: chessSchema,
    plugins: [plugin304],
    catchAllError: true,
  });

  let startTime = 0;
  let endTime = -API_THROTTLE_TTL;
  const cachedGames = new Map();

  async function getGames(tournDate) {
    const params = {
      year: String(tournDate.year),
      month: String(tournDate.month).padStart(2, "0"),
    };
    const slug = `${params.year}${sep}${params.month}`;

    logger.debug("Call getGames() with params: {*}", params);

    if (now() - endTime <= API_THROTTLE_TTL) {
      logger.debug(`Using cachedGames because of API_THROTTLE_TTL`);
      return cachedGames.get(slug) ?? [];
    }

    startTime = now();
    const { data, error } = await $fetch("/games/:year/:month", { params });
    endTime = now();

    logger.debug("Request to ChessAPI complete in {dur} ms", {
      dur: Math.floor(endTime - startTime),
    });

    if (error) {
      logger.warn(`Using cachedGames because of ChessAPI error: {*}`, error);
      return cachedGames.get(slug) ?? [];
    }

    cachedGames.set(slug, data.games);
    return data.games;
  }

  return { getGames };
}
