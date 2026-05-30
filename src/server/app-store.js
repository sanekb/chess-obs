import { signal } from "@preact/signals-core";
import { env } from "@/server/env.js";

export const store = {
  playerName: env.playerName,

  lastGameId: signal(0),
  gameOffset: 0,

  isWatchModeEnabled: signal(false),
  watchModeLoopTid: 0,
  watchModeAutoOffTid: 0,

  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  sseListeners: new Set(),

  clientify() {
    return {
      playerName: this.playerName,
      lastGameId: this.lastGameId.value,
      isWatchModeEnabled: this.isWatchModeEnabled.value,
      gameResults: this.gameResults.value,
      isBonusEnabled: this.isBonusEnabled.value,
      isPrizeEnabled: this.isPrizeEnabled.value,
    };
  },
};
