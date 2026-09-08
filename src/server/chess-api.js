import { now, sep } from "@/server/utils.js";
import { plugin304 } from "@/server/plugin304.js";
import { API_THROTTLE_TTL, APP_NAME, ZONE } from "@/consts.js";
import * as v from "valibot";
import { createFetch, createSchema } from "better-fetch";
import { getLogger } from "logtape";

const logger = getLogger([APP_NAME, "chess-api"]);

const userSchema = v.object({
  "displayName": v.string(),
  "finalRating": v.number(),
  "ratingDiff": v.number(),
  "rating": v.optional(v.number()),
  "result": v.string(),
});
const gameSchema = v.object({
  "game": v.object({
    "endedAt": v.string(),
    "chessGame": v.object({
      "whitePlayer": userSchema,
      "blackPlayer": userSchema,
    }),
    "tournamentData": v.optional(v.object({
      "round": v.number(),
    })),
  }),
});
const flatSchema = v.pipe(
  gameSchema,
  v.transform((input) => {
    const { endedAt, chessGame, tournamentData } = input.game;
    const { whitePlayer, blackPlayer } = chessGame;

    const white = {
      username: whitePlayer.displayName,
      rating: whitePlayer.finalRating - whitePlayer.ratingDiff,
      result: whitePlayer.result,
    };
    const black = {
      username: blackPlayer.displayName,
      rating: blackPlayer.finalRating - blackPlayer.ratingDiff,
      result: blackPlayer.result,
    };

    return {
      endedAt: Temporal.Instant.from(endedAt).toZonedDateTimeISO(ZONE)
        .toPlainDateTime(),
      white,
      black,
      tour: tournamentData?.round,
    };
  }),
);
const gamesSchema = v.object({
  "hydratedGames": v.array(flatSchema),
});

export function createChessApi({ playerName, playerId, devEmail }) {
  const chessSchema = createSchema({
    "@post/HydrateGamesByCriteria": {
      output: gamesSchema,
    },
  });

  const $fetch = createFetch({
    baseURL:
      `https://www.chess.com/service/player-game-archive-v2/chesscom.game_gateway.v2.GameGatewayService`,
    headers: { "User-Agent": `${APP_NAME}/1.4 (contact: ${devEmail})` },
    schema: chessSchema,
    // plugins: [plugin304],
    catchAllError: true,
  });

  let startTime = 0;
  let endTime = -API_THROTTLE_TTL;
  const cachedGames = new Map();

  async function getGames(tournDate) {
    // const params = {
    //   year: String(tournDate.year),
    //   month: String(tournDate.month).padStart(2, "0"),
    // };
    const slug = `HydrateGamesByCriteria`;

    logger.debug("Call getGames()");

    if (now() - endTime <= API_THROTTLE_TTL) {
      logger.debug(`Using cachedGames because of API_THROTTLE_TTL`);
      return cachedGames.get(slug) ?? [];
    }

    startTime = now();
    const { data, error } = await $fetch("@post/HydrateGamesByCriteria", {
      body: {
        "criteria": {
          "username": playerName,
          "isVsComputer": false,
          "page": 1,
          "pageSize": 50,
          "playerId": playerId,
          "isVsCoach": false,
        },
        "fieldMask": "game",
      },
    });
    endTime = now();

    logger.debug("Request to ChessAPI complete in {dur} ms", {
      dur: Math.floor(endTime - startTime),
    });

    if (error) {
      logger.warn(`Using cachedGames because of ChessAPI error: {*}`, error);
      return cachedGames.get(slug) ?? [];
    }

    cachedGames.set(slug, data.hydratedGames);
    return data.hydratedGames;
  }

  return { getGames };
}
