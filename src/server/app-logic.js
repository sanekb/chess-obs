import { getGames } from "@/server/chess-api.js";
import { store } from "@/server/app-store.js";
import { WATCH_MODE_AUTO_OFF_TIME, WATCH_MODE_INTERVAL } from "@/consts.js";
import { env } from "@/server/env.js";

export async function setLgidByOffset(off) {
  const games = await getGames();

  store.gameOffset = off === 0 ? 0 : Math.max(0, store.gameOffset + off);
  store.lastGameId.value = games[store.gameOffset]?.id ?? 0;

  await updateResults();
}

export async function updateResults() {
  const { gameResults, lastGameId } = store;

  const games = await getGames();
  const i = games.findIndex((g) => g.id === lastGameId.value);
  const results = games.slice(0, i).reverse().map((g) =>
    g.user1.username === env.playerName ? g.user1Result : g.user2Result
  );

  gameResults.value = results;
}

export async function toggleWatchMode() {
  const { isWatchModeEnabled } = store;
  isWatchModeEnabled.value = !isWatchModeEnabled.value;

  if (!isWatchModeEnabled.value) {
    clearTimeout(store.watchModeLoopTid);
    clearTimeout(store.watchModeAutoOffTid);
  }

  store.watchModeAutoOffTid = setTimeout(
    () => isWatchModeEnabled.value = false,
    WATCH_MODE_AUTO_OFF_TIME,
  );

  (async function loop() {
    store.watchModeLoopTid = setTimeout(async () => {
      if (isWatchModeEnabled.value) {
        await updateResults();
        await loop();
      }
    }, WATCH_MODE_INTERVAL);
  })();

  await updateResults();
}

export function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
}

export function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
}
