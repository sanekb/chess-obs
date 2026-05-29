import { env } from "@/server/env.js";
import { throttleTtl } from "@/consts.js";

const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));
const cache = { games: mock.data, time: Infinity };

const endpoint = (m) =>
  `https://www.chess.com/callback/games/extended-archive?locale=en&username=${m}&page=1`;

export async function getGames() {
  if (performance.now() - cache.time < throttleTtl) return cache.games;

  const headers = {
    "User-Agent": `chess-obs/0.1.0 (contact: ${env.devEmail})`,
  };

  try {
    const res = await fetch(endpoint(env.member), { headers });

    if (!res.ok) {
      throw new Error(`Ошибка HTTP: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Сервер вернул не JSON формат!");
    }

    const games = (await res.json()).data;

    // if (
    //   !json || typeof json !== "object" || !("@id" in json) ||
    //   !("username" in json)
    // ) {
    //   throw new Error("Неверная или поврежденная структура JSON ответа");
    // }

    cache.games = games;
    cache.time = performance.now();

    return games;
  } catch (error) {
    console.error(
      `Не удалось загрузить данные для ${env.member}:`,
      error.message,
    );
    return mock;
  }

  // await new Promise((r) => setTimeout(r, 0));

  // cache.json = mock;
  // cache.time = performance.now();
}
