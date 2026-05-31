import { signal } from "@preact/signals";
import { RECONNECT_DELAYS } from "@/consts.js";

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

let es = null;
let attempt = 0;
let reconnectTimer = null;

(function connectSSE() {
  if (es) es.close();

  es = new EventSource(`/sse`);
  es.onopen = () => {
    attempt = 0;
  };
  es.onmessage = (event) => {
    store.parse(JSON.parse(event.data));
  };

  es.onerror = () => {
    es.close();

    const delay = RECONNECT_DELAYS[attempt++] ??
      RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1];

    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connectSSE();
    }, delay);
  };
})();
