import { env } from "./env.js";
import { throttleTtl } from "../../consts.js";

const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));
const cache = { json: mock, time: Infinity };

export async function getGamesViaApi() {
  if (performance.now() - cache.time < throttleTtl) return cache.json;

  const headers = {
    "User-Agent": `chess-obs/0.1.0 (contact: ${env.devEmail})`,
  };

  try {
    const response = await fetch(
      `https://www.chess.com/callback/games/extended-archive?locale=en&username=${env.member}&page=1`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Сервер вернул не JSON формат!");
    }

    const json = await response.json();

    // if (
    //   !json || typeof json !== "object" || !("@id" in json) ||
    //   !("username" in json)
    // ) {
    //   throw new Error("Неверная или поврежденная структура JSON ответа");
    // }

    cache.json = json;
    cache.time = performance.now();

    return json;
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
