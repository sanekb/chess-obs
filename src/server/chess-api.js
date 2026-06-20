import { env } from "@/server/env.js";
import { API_THROTTLE_TTL } from "@/consts.js";
import { list, num, obj, str } from "@oxi/schema";

// const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));

const endpoint = (user) =>
  `https://www.chess.com/callback/games/extended-archive?locale=en&username=${user}&page=1`;

const gamesSchema = obj({
  data: list(
    obj({
      id: num(),
      user1Result: num(),
      user2Result: num(),
      user1: obj({ username: str() }),
      user2: obj({ username: str() }),
    }),
  ),
});

const cache = { games: [], time: -Infinity };

export function getCachedGames() {
  return Promise.resolve(cache.games);
}

export function getGames() {
  if (performance.now() - cache.time < API_THROTTLE_TTL) {
    return Promise.resolve(cache.games);
  }

  return fetch(endpoint(env.playerName), {
    headers: { "User-Agent": `chess-obs/0.1.0 (contact: ${env.devEmail})` },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Ошибка HTTP: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }).then((json) => {
    const res = gamesSchema.parse(json);

    if (res.isErr()) throw new Error(`схема ответа не та`);
    const games = res.unwrap().data.toArray();
    cache.games = games;
    cache.time = performance.now();
    console.log("chess-API", games.length);

    return games;
  }).catch((err) => {
    console.error(
      `Не удалось загрузить данные для ${env.playerName}:`,
      err.message,
    );
    return Promise.resolve(cache.games);
  });
}
