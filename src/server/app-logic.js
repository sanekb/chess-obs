import { getGames } from "@/server/chess-api.js";
import { store } from "@/server/app-store.js";
import { autoOff, interval } from '@/consts.js';
import { env } from '@/server/env.js';

export async function setGidByOffset(off) {
  const games = await getGames();

  if (off === 0) store.offset = off;
  if (off !== 0) store.offset += off;

  store.offset = Math.max(0, store.offset);
  store.lastGameId = games[store.offset].id;

  await calcStats();
}

export async function calcStats() {
  const games = await getGames();
  const i = games.findIndex((g) => g.id === store.lastGameId);
  const stats = games.slice(0, i).reverse().map((g) => {
    if (g.user1Result === 0.5) return 0.5;
    if (g.user1.username === env.member) return g.user1Result;
    if (g.user2.username === env.member) return g.user2Result;
    return -1;
  });

  store.stats.value = stats;
}

export async function toggleWatchMode() {
  store.watch = !store.watch;

  if (store.watch) {
    await calcStats();

    (async function loop() {
      store.timerId = setTimeout(async () => {
        if (store.watch) {
          await calcStats();
          await loop();
        }
      }, interval);
    })();

    store.autoOffId = setTimeout(()=>store.watch=false, autoOff);
  } else {
    clearTimeout(store.timerId);
    clearTimeout(store.autoOffId);
  }
}
