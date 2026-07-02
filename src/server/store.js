import { effect, signal } from "preact-signals-core";
import { env } from "@/server/env.js";
import { getLogger } from "logtape";
import { APP_NAME } from "@/consts.js";

const logger = getLogger([APP_NAME, "store"]);

export const store = {
  playerName: env.playerName,

  lastGameId: signal(0),
  gameOffset: 0,

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),
  watchModeLoopTid: null,

  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  clientify() {
    return {
      playerName: this.playerName,
      lastGameId: this.lastGameId.value,

      isWatchModeEnabled: this.isWatchModeEnabled.value,
      watchModeAutoOff: this.watchModeAutoOff.value,

      gameResults: this.gameResults.value,

      isBonusEnabled: this.isBonusEnabled.value,
      isPrizeEnabled: this.isPrizeEnabled.value,
    };
  },
};

effect(() =>
  logger.info("gameResults changed: {results}", {
    results: store.gameResults.value,
  })
);
