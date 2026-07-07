import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { basicAuth } from "hono/basic-auth";
import { streamSSE } from "hono/streaming";
import { trimTrailingSlash } from "hono/trailing-slash";
import { emptyFn, env, noContent } from "@/server/utils.js";
import { store } from "@/server/store.js";
import {
  changeTournDate,
  toggleBonus,
  togglePrize,
  toggleWatchMode,
  updateTourResults,
} from "@/server/logic.js";
import { getGames } from "@/server/chess-api.js";
import { render } from "preact-render-to-string";
import { APP_NAME, TAG } from "@/consts.js";
import { getLogger } from "logtape";

const logger = getLogger([APP_NAME, "hono"]);

const Layout = () => (
  <html>
    <head>
      <title>{APP_NAME}</title>
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
    s.writeSSE({ data: JSON.stringify(store.clientify()) });
    logger.debug("Add new SSE connection");
  },
  del(s) {
    this.streams.delete(s);
    logger.debug("Del SSE connection on abort");
  },
  broadcast(data) {
    this.streams.forEach((s) => !s.aborted && s.writeSSE({ data }));
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
  .get("/", (c) => {
    logger.info`User ${c.get("user")} opened Dashboard`;
    return c.html(SSR("dashboard", store.clientify()));
  })
  .post("/change/:dir", async (c) => {
    const dir = parseInt(c.req.param("dir"));
    logger.info`POST /change/${dir}`;
    changeTournDate(dir);
    const games = await getGames(store.tournDate.value);
    updateTourResults(games);
    return noContent(c);
  })
  .post("/refresh", async (c) => {
    logger.info`POST /refresh`;
    const games = await getGames(store.tournDate.value);
    updateTourResults(games);
    return noContent(c);
  })
  .post("/watch", (c) => {
    logger.info`POST /watch`;
    toggleWatchMode(getGames);
    return noContent(c);
  })
  .post("/bonus", (c) => {
    logger.info`POST /bonus`;
    toggleBonus();
    return noContent(c);
  })
  .post("/prize", (c) => {
    logger.info`POST /prize`;
    togglePrize();
    return noContent(c);
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
      return new Promise(emptyFn);
    });
  });
