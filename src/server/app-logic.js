import { store } from "@/server/app-store.js";
import { WATCH_MODE_AUTO_OFF_TIME, WATCH_MODE_INTERVAL } from "@/consts.js";
import { env } from "@/server/env.js";
import { getGames } from "@/server/chess-api.js";

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
    g.user1.username === env.playerName ? g.user1Result : g.user2Result
  );

  store.gameOffset = o;
  gameResults.value = results;
}

export async function toggleWatchMode(games) {
  const { isWatchModeEnabled } = store;
  isWatchModeEnabled.value = !isWatchModeEnabled.value;

  clearTimeout(store.watchModeLoopTid);
  clearTimeout(store.watchModeAutoOffTid);

  if (!isWatchModeEnabled.value) return;

  updateResults(games);

  (function loop() {
    store.watchModeLoopTid = setTimeout(async () => {
      if (isWatchModeEnabled.value) {
        updateResults(await getGames());
        loop();
      }
    }, WATCH_MODE_INTERVAL);
  })();

  store.watchModeAutoOffTid = setTimeout(
    () => isWatchModeEnabled.value = false,
    WATCH_MODE_AUTO_OFF_TIME,
  );
}

export function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
}

export function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
}
