import { Hono } from "@hono/hono";
import { routePath } from "@hono/hono/route";
import { serveStatic } from "@hono/hono/deno";
import { basicAuth } from "@hono/hono/basic-auth";
import { streamSSE } from "@hono/hono/streaming";
import { env } from "@/server/env.js";
import { store } from "@/server/app-store.js";
import {
  changeGameOffset,
  toggleBonus,
  togglePrize,
  toggleWatchMode,
  updateResults,
} from "@/server/app-logic.js";
import { effect } from "@preact/signals-core";
import { getCachedGames, getGames } from "@/server/chess-api.js";

const json = (obj) => JSON.stringify(obj);
const html = (page, state) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>chess-obs</title>
  		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="stylesheet" href="/app.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    </head>
    <body class="overflow-hidden">
        <script id="init-data" type="application/json">
            ${json({ page, state })}
        </script>
        <script type="module" src="/app.js"></script>
    </body>
    </html>
  `;

const dashboard = new Hono()
  .basePath("/dashboard")
  .use(
    "*",
    basicAuth({
      username: env.user,
      password: env.pass,
    }),
  )
  .use("*", async (c, next) => {
    if (routePath(c) === "/") {
      return await next();
    }
    await next();
    return c.body(null, 204);
  })
  .get("/", (c) =>
    c.html(
      html("dashboard", store.clientify()),
    ))
  .post("/offset/:off", async (c) => {
    changeGameOffset(parseInt(c.req.param("off")), await getCachedGames());
  })
  .post("/refresh", async (c) => {
    updateResults(await getGames());
  })
  .post("/watch", async (c) => {
    toggleWatchMode(await getGames());
  })
  .post("/bonus", (c) => {
    toggleBonus();
  })
  .post("/prize", (c) => {
    togglePrize();
  });

const widget = new Hono()
  .basePath("/widget")
  .get(
    "/",
    (c) =>
      c.html(
        html("widget", store.clientify()),
      ),
  );

const app = new Hono()
  .use("*", serveStatic({ root: "./public" }))
  .get("/", (c) => c.redirect("/dashboard"))
  .route("/", dashboard)
  .route("/", widget)
  .get("/sse", (c) => {
    return streamSSE(c, (s) => {
      store.sseListeners.add(s);
      s.onAbort(() => {
        store.sseListeners.delete(s);
      });
      return new Promise(() => {});
    });
  });

changeGameOffset(0, await getGames());

effect(() => {
  const state = json(store.clientify());

  for (const stream of store.sseListeners) {
    stream.writeSSE({ data: state }).catch((e) => {
      store.sseListeners.delete(stream);
      console.warn("Dead SSE listener remove");
    });
  }
});

Deno.serve({ port: 8000 }, app.fetch);
