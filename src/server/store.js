import { effect, Signal, signal } from "preact-signals-core";
import { env } from "@/server/utils.js";
import { getLogger } from "logtape";
import { APP_NAME } from "@/consts.js";

const logger = getLogger([APP_NAME, "store"]);

export const store = {
  playerName: signal(env.playerName),

  lastGameId: signal(0),
  gameOffset: 0,

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),
  watchModeLoopTid: null,

  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  clientify() {
    return Object.fromEntries(
      Object.entries(this)
        .filter(([k, v]) => (v instanceof Signal))
        .map(([k, v]) => [k, v.value]),
    );
  },
};

effect(() =>
  logger.info("gameResults changed: {results}", {
    results: store.gameResults.value,
  })
);
