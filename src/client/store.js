import { signal } from "preact-signals";

export const store = {
  playerName: signal(""),

  tournDateStr: signal(""),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),

  tourResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  parse(state) {
    Object.entries(state).forEach(([k, v]) => this[k].value = v);
  },
};
