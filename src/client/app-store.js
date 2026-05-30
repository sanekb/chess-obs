import { signal } from "@preact/signals";

export const store = {
	
  playerName: signal("")

  lastGameId: signal(0),

  isWatchModeEnabled: signal(false),
  gamesResults: signal([]),

  isBonusEnabled: signal(false),
  isPrizeEnabled: signal(true),

};


const eventSource = new EventSource(`/sse`);

eventSource.onmessage = (event) => {

  const _store = JSON.parse(event.data);

  store.playerName.value = _store.playerName;
  store.lastGameId.value = _store.lastGameId;
  store.isWatchModeEnabled.value = _store.isWatchModeEnabled;
  store.gamesResults.value = _store.gamesResults;
  store.isBonusEnabled.value = _store.isBonusEnabled;
  store.isPrizeEnabled.value = _store.isPrizeEnabled;

};