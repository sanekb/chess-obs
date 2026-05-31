import { env } from "@/server/env.js";
import { API_THROTTLE_TTL } from "@/consts.js";

const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));
const cache = { games: mock.data, time: Infinity };
const endpoint = (user) =>
  `https://www.chess.com/callback/games/extended-archive?locale=en&username=${user}&page=1`;

export async function getGames() {
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
    const games = json.data;
    cache.games = games;
    cache.time = performance.now();
    console.log("successful api req.");
    return games;
  }).catch((err) => {
    console.error(
      `Не удалось загрузить данные для ${env.playerName}:`,
      err.message,
    );
    return Promise.resolve(cache.games);
  });
}
