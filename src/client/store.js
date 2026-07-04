import { signal } from "preact-signals";

export const store = {
  playerName: signal(""),

  // tournamentDateString: signal(""),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),

  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  parse(state) {
    Object.entries(state).forEach(([k, v]) => this[k].value = v);
  },
};
