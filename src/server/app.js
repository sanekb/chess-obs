import { changeGameOffset } from "@/server/logic.js";
import { getGames } from "@/server/chess-api.js";
import { effect } from "preact-signals-core";
import { store } from "@/server/store.js";
import { app, sseManager } from "@/server/hono.jsx";

changeGameOffset(0, await getGames());

effect(() => {
  sseManager.broadcast(JSON.stringify(store.clientify()));
});

Deno.serve({ port: 8000 }, app.fetch);
