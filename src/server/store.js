import { Signal, signal } from "preact-signals-core";
import { compat, env, today } from "@/server/utils.js";

export const store = {
  playerName: signal(env.playerName),

  tournDate: compat(today()),
  tournDateStr: signal(""),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),
  watchModeAbortController: compat(null),

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
