import { signal } from "@preact/signals";

export const store = {
  playerName: signal(""),

  lastGameId: signal(0),

  isWatchModeEnabled: signal(false),
  gameResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

  parse(state) {
    for (const prop in state) {
      this[prop].value = state[prop];
    }
  },
};

const eventSource = new EventSource(`/sse`);

eventSource.onmessage = (event) => {
  const state = JSON.parse(event.data);
  store.parse(state);
};
