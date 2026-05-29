import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { basicAuth } from "@hono/hono/basic-auth";
import { streamSSE } from "@hono/hono/streaming";
import { env } from "@/server/env.js";
import { store } from "@/server/app-store.js";
import { offset, refresh, watch } from "@/server/app-logic.js";

const json = (obj) => JSON.stringify(obj);
const html = (page, state) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Chess OBS</title>
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
    return c.json(store);
  })
  .get("/", (c) =>
    c.html(
      html("dashboard", store),
    ))
  .post("/offset/:off", async (c) => {
    await offset(parseInt(c.req.param("off")));
  })
  .post("/watch", async (c) => {
    await watch();
  })
  .post("/refresh", async (c) => {
    await refresh();
  });

const widget = new Hono()
  .basePath("/widget")
  .get(
    "/",
    (c) =>
      c.html(
        html("widget", store),
      ),
  )
  .get("/sse", (c) => {
    return streamSSE(c, async (s) => {
      store.streams.add(s);
      s.onAbort(() => store.streams.delete(s));
      return new Promise(() => {});
    });
  });

const app = new Hono();

app.use("*", serveStatic({ root: "./public" }));

app.get("/", (c) => c.redirect("/dashboard"));
app.route("/", dashboard);
app.route("/", widget);

Deno.serve({ port: 8000 }, app.fetch);
