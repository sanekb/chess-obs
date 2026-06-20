import { signal } from "preact-signals";

export const store = {
  playerName: signal(""),

  lastGameId: signal(0),

  isWatchModeEnabled: signal(false),
  watchModeAutoOff: signal(0),

  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  parse(state) {
    for (const prop in state) {
      this[prop].value = state[prop];
    }
  },
};
