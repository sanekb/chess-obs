import { getGamesViaApi } from "@/server/chess-api.js";
import { store } from "@/sever/app-store.js";

export async function offset(off) {
  const games = (await getGamesViaApi()).data;

  if (off === 0) store.offset = off;
  if (off !== 0) store.offset += off;

  store.offset = Math.max(0, store.offset);
  store.lastGameId = games[store.offset].id;

  await refresh();
}

export async function refresh() {
  const games = (await getGamesViaApi()).data;
  const i = games.findIndex((g) => g.id === store.lastGameId);
  const stats = games.slice(0, i).reverse().map((g) => {
    if (g.user1Result === 0.5) return 0.5;
    if (g.user1.username === env.member) return g.user1Result;
    if (g.user2.username === env.member) return g.user2Result;

    return -1;
  });

  store.stats = stats;

  await writeSSE();
}

export async function watch() {
  store.watch = !store.watch;

  if (store.watch) {
    await refresh();

    (async function loop() {
      store.timerId = setTimeout(async () => {
        if (store.watch) {
          await refresh();
          await loop();
        }
      }, interval);
    })();

    store.autoOffId = setTimeout(watch, autoOff);
  } else {
    clearTimeout(store.timerId);
    clearTimeout(store.autoOffId);
  }
}

async function writeSSE() {
  for (const stream of store.streams) {
    await stream.writeSSE({ data: JSON.stringify(store) });
  }
}
