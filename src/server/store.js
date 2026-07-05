import { Signal, signal } from "preact-signals-core";
import { env } from "@/server/utils.js";

export const store = {
  playerName: signal(env.playerName),

  tournDate: Temporal.Now.plainDateISO(),
  tournDateStr: signal(""),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),
  watchModeAbortSignal: null,

  tourResults: signal([]),

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
