import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { basicAuth } from "@hono/hono/basic-auth";
import { streamSSE } from "@hono/hono/streaming";
import { env } from "@/server/env.js";
import { store } from "@/server/app-store.js";
import {
  calcStats,
  setGidByOffset,
  toggleBonus,
  toggleWatchMode,
} from "@/server/app-logic.js";
import { effect, untracked } from "@preact/signals-core";

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

const pushEvent = async (data) => {
  for (const stream of store.streams) {
    await stream.writeSSE({ data: json(data) });
  }
};

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
    return c.json(store.clientify());
  })
  .get("/", (c) =>
    c.html(
      html("dashboard", store.clientify()),
    ))
  .post("/bonus", async (c) => {
    await toggleBonus();
  })
  .post("/offset/:off", async (c) => {
    await setGidByOffset(parseInt(c.req.param("off")));
  })
  .post("/refresh", async (c) => {
    await calcStats();
  })
  .post("/watch", async (c) => {
    await toggleWatchMode();
  });

const widget = new Hono()
  .basePath("/widget")
  .get(
    "/",
    (c) =>
      c.html(
        html("widget", store.clientify()),
      ),
  )
  .get("/sse", (c) => {
    return streamSSE(c, async (s) => {
      store.streams.add(s);
      s.onAbort(() => {
        store.streams.delete(s);
      });
      return new Promise(() => {});
    });
  });

const app = new Hono();

app.use("*", serveStatic({ root: "./public" }));

app.get("/", (c) => c.redirect("/dashboard"));
app.route("/", dashboard);
app.route("/", widget);

setGidByOffset(0);

effect(() => {
  store.stats.value;
  store.bonus.value;
  pushEvent(untracked(() => store.clientify()));
});

Deno.serve({ port: 8000 }, app.fetch);
