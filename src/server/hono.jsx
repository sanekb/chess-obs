import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { basicAuth } from "hono/basic-auth";
import { streamSSE } from "hono/streaming";
import { trimTrailingSlash } from "hono/trailing-slash";
import { env, getArchiveDateTouple } from "@/server/utils.js";
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
import { batch } from "preact-signals-core";
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
    logger.debug("add SSE connection");
  },
  del(s) {
    this.streams.delete(s);
    logger.debug("del SSE connection");
  },
  broadcast(data) {
    this.streams.forEach((s) => !s.aborted && s.writeSSE({ data }));
  },
};

export const getGamesByTournDate = async () => {
  const adt = getArchiveDateTouple(store.tournDate);
  const games = await getGames(adt);
  return games;
};

const nocontent = (c) => c.body(null, 204);

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
    logger.info("user {user} opened Dashboard", { user: c.get("user") });
    return c.html(SSR("dashboard", store.clientify()));
  })
  .post("/change/:dir", async (c) => {
    changeTournDate(parseInt(c.req.param("dir")));
    const games = await getGamesByTournDate();
    updateTourResults(games);
    return nocontent(c);
  })
  .post("/refresh", async (c) => {
    const games = await getGamesByTournDate();
    updateTourResults(games);
    return nocontent(c);
  })
  .post("/watch", (c) => {
    toggleWatchMode(getGamesByTournDate);
    return nocontent(c);
  })
  .post("/bonus", (c) => {
    toggleBonus();
    return nocontent(c);
  })
  .post("/prize", (c) => {
    togglePrize();
    return nocontent(c);
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
