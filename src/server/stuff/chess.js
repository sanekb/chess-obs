import { devEmail, member } from "./env";

const mock = JSON.parse(Deno.readTextFileSync("./src/mock.json"));
const cache = { json: null, time: -Infinity };

async function getGamesViaApi() {
  if (performance.now() - cache.time < 5e3) return cache.json;

  const headers = {
    "User-Agent": `chess-obs/0.1.0 (contact: ${devEmail})`,
  };

  try {
    const response = await fetch(
      `https://www.chess.com/callback/games/extended-archive?locale=en&username=${member}&page=1`,
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
      `Не удалось загрузить данные для ${ member }:`,
      error.message,
    );
    return mock;
  }

  // await new Promise((r) => setTimeout(r, 0));

  // cache.json = mock;
  // cache.time = performance.now();
}
