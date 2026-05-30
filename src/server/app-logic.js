import { getGames } from "@/server/chess-api.js";
import { store } from "@/server/app-store.js";
import { autoOff, interval } from "@/consts.js";
import { env } from "@/server/env.js";

export async function setLgidByOffset(off) {
  const games = await getGames();

  if (off === 0) store.gameOffset = off;
  if (off !== 0) store.gameOffset += off;

  store.gameOffset = Math.max(0, store.gameOffset);
  store.lastGameId.value = games[store.gameOffset].id;

  await updateResults();
}

export async function updateResults() {
  const { gameResults, lastGameId } = store;

  const games = await getGames();
  const i = games.findIndex((g) => g.id === lastGameId.value);
  const results = games.slice(0, i).reverse().map((g) => {
    return g.user1.username === env.playerName ? g.user1Result : g.user2Result;
    // if (g.user1Result === 0.5) return 0.5;
    // if (g.user1.username === env.playerName) return g.user1Result;
    // if (g.user2.username === env.playerName) return g.user2Result;
    // return -1;
  });

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
    autoOff,
  );
  // store.autoOffStart = Date.now();

  (async function loop() {
    store.watchModeLoopTid = setTimeout(async () => {
      if (isWatchModeEnabled.value) {
        await updateResults();
        await loop();
      }
    }, interval);
  })();

  await updateResults();
}

export async function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
}

export async function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
}
