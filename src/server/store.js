import { computed, Signal, signal } from "preact-signals-core";
import { env } from "@/server/utils.js";

export const store = {
  playerName: signal(env.playerName),

  tournamentDate: signal(Temporal.Now.plainDateISO()),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),
  watchModeLoopTid: 0,

  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  clientify() {
    return Object.fromEntries(
      Object.entries(this)
        .filter(([k, v]) => (v instanceof Signal && k !== "tournamentDate"))
        .map(([k, v]) => [k, v.value]),
    );
  },
};
