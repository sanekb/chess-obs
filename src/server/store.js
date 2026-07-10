import { Signal, signal } from "preact-signals-core";
import { compat, env, getLastTournDate, localDate } from "@/server/utils.js";
import { BONUS_FOR_TOP30 } from "@/consts.js";

export const store = {
  playerName: signal(env.playerName),

  tournDate: compat(getLastTournDate()),
  tournDateStr: signal(localDate(getLastTournDate())),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),
  watchModeAbortController: compat(null),

  tourResults: signal([]),

  isPrizeEnabled: signal(false),
  isBonusEnabled: signal(false),
  bonusAmount: signal(BONUS_FOR_TOP30),

  clientify() {
    return Object.fromEntries(
      Object.entries(this)
        .filter(([k, v]) => (v instanceof Signal))
        .map(([k, v]) => [k, v.value]),
    );
  },
};
