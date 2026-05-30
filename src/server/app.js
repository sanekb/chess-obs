import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { basicAuth } from "@hono/hono/basic-auth";
import { streamSSE } from "@hono/hono/streaming";
import { env } from "@/server/env.js";
import { store } from "@/server/app-store.js";
import {
  updateResults,
  setLgidByOffset,
  toggleWatchMode,
  toggleBonus,
  togglePrize,
} from "@/server/app-logic.js";
import { effect } from "@preact/signals-core";

const json = (obj) => JSON.stringify(obj);
const html = (page, state) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>chess-obs</title>
  		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/app.css">
    </head>
    <body>
        <script id="initial-state" type="application/json">
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
    if (c.req.routePath === "/") {
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
    await setLgidByOffset(parseInt(c.req.param("off")));
  })
  .post("/refresh", async (c) => {
    await updateResults();
  })
  .post("/watch", async (c) => {
    await toggleWatchMode();
  })
  .post("/bonus", async (c) => {
    await toggleBonus();
  })
  .post("/prize", async (c) => {
    await togglePrize();
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
    return streamSSE(c, async (s) => {
      store.sseListeners.add(s);
      s.onAbort(() => {
        store.sseListeners.delete(s);
      });
      return new Promise(() => {});
    });
  });


setLgidByOffset(0);

effect(() => {

  const storeJson = json(store.clientify());

  for (const stream of store.sseListeners) {
    await sseListeners.writeSSE({ data: storeJson });
  }
});

Deno.serve({ port: 8000 }, app.fetch);
