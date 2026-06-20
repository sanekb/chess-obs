import { Hono } from "hono";
import { basePath } from "hono/route";
import { serveStatic } from "hono/deno";
import { basicAuth } from "hono/basic-auth";
import { streamSSE } from "hono/streaming";
import { trimTrailingSlash } from "hono/trailing-slash";
import { env } from "@/server/env.js";
import { store } from "@/server/store.js";
import {
  changeGameOffset,
  toggleBonus,
  togglePrize,
  toggleWatchMode,
  updateResults,
} from "@/server/logic.js";
import { getCachedGames, getGames } from "@/server/chess-api.js";
import { render } from "preact-render-to-string";
import { batch } from "preact-signals-core";
import { TAG, TITLE } from "@/consts.js";

const Layout = () => (
  <html>
    <head>
      <title>{TITLE}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link
        rel="preload"
        href="/montserrat-wght.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
      <link rel="stylesheet" href="/app.css" />
      <script type="module" src="/app.js"></script>
      <script type="application/json" id="init-data">{TAG}</script>
    </head>
  </html>
);

const SSR = (page, state) => {
  const init = JSON.stringify({ page, state });
  const html = render(<Layout />);
  return `<!DOCTYPE html>${html.replace(TAG, init)}`;
};

export const sseManager = {
  streams: new Set(),
  add(s) {
    this.streams.add(s);
  },
  del(s) {
    this.streams.delete(s);
  },
  broadcast(data) {
    this.streams.forEach((s) =>
      s.writeSSE({ data }).catch((e) => {
        this.del(s);
        console.warn("Dead SSE listener remove");
      })
    );
  },
};

const dashboard = new Hono()
  .basePath("/dashboard")
  .use(
    basicAuth({
      username: env.playerName,
      password: env.playerPassword,
      onAuthSuccess: (c, user) => c.set("user", user),
    }, {
      username: env.devEmail,
      password: env.devPassword,
    }),
  )
  .use("*", async (c, next) => {
    const isRoot = c.req.path.substring(basePath(c).length) === "";
    if (isRoot) {
      return await next();
    }
    await next();
    return c.body(null, 204);
  })
  .get("/", (c) => {
    console.log(c.get("user"));
    return c.html(SSR("dashboard", store.clientify()));
  })
  .post("/offset/:off", async (c) => {
    const games = await getCachedGames();
    batch(() => changeGameOffset(parseInt(c.req.param("off")), games));
  })
  .post("/refresh", async (c) => {
    const games = await getGames();
    batch(() => updateResults(games));
    // await new Promise((r) => setTimeout(r, 1e3));
    // return c.body("gg", 500);
  })
  .post("/watch", async (c) => {
    batch(() => toggleWatchMode(getGames));
  })
  .post("/bonus", (c) => {
    batch(() => toggleBonus());
  })
  .post("/prize", (c) => {
    batch(() => togglePrize());
  });

const widget = new Hono()
  .basePath("/widget")
  .get(
    "/",
    (c) => c.html(SSR("widget", store.clientify())),
  );

export const app = new Hono()
  .use(trimTrailingSlash())
  .use(serveStatic({ root: "./public" }))
  .get("/", (c) => c.redirect("/dashboard"))
  .route("/", dashboard)
  .route("/", widget)
  .get("/sse", (c) => {
    return streamSSE(c, (s) => {
      sseManager.add(s);
      s.onAbort(() => sseManager.del(s));
      return new Promise(() => {});
    });
  });
