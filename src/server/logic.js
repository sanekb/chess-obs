import { store } from "@/server/store.js";
import {
  GM_SCORE,
  WATCH_MODE_AUTO_OFF,
  WATCH_MODE_INTERVAL,
} from "@/consts.js";
import { env } from "@/server/env.js";
import { batch } from "preact-signals-core";

export function changeGameOffset(off, games) {
  store.gameOffset = Math.min(
    off === 0 ? 0 : Math.max(0, store.gameOffset + off),
    games.length - 1,
  );
  store.lastGameId.value = games[store.gameOffset]?.id ?? 0;

  updateResults(games);
}

export function updateResults(games) {
  const { gameResults, lastGameId } = store;

  const i = games.findIndex((g) => g.id === lastGameId.value);
  const o = Math.max(0, i);

  const results = games.slice(0, o).reverse().map((g) =>
    g.user1.username === env.playerName
      ? [g.user1Result, g.user2Rating >= GM_SCORE]
      : [g.user2Result, g.user1Rating >= GM_SCORE]
  );

  store.gameOffset = o;
  gameResults.value = results;
}

export function toggleWatchMode(games, getGames) {
  const { isWatchModeEnabled, watchModeAutoOff } = store;
  isWatchModeEnabled.value = !isWatchModeEnabled.value;

  if (!isWatchModeEnabled.value) {
    watchModeAutoOff.value = 0;
    clearTimeout(store.watchModeLoopTid);
    return;
  }

  updateResults(games);
  watchModeAutoOff.value = WATCH_MODE_AUTO_OFF;

  (function loop() {
    store.watchModeLoopTid = setTimeout(async () => {
      const games = await getGames();
      batch(() => {
        updateResults(games);
        watchModeAutoOff.value--;

        if (watchModeAutoOff.value <= 0) {
          isWatchModeEnabled.value = false;
          return;
        }

        loop();
      });
    }, WATCH_MODE_INTERVAL);
  })();
}

export function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
}

export function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
}
