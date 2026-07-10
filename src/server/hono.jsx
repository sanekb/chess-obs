import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { basicAuth } from "hono/basic-auth";
import { streamSSE } from "hono/streaming";
import { trimTrailingSlash } from "hono/trailing-slash";
import { vValidator as vali } from "hono-valibot";
import { badRequest, emptyFn, env, noContent } from "@/server/utils.js";
import { render } from "preact-render-to-string";
import { APP_NAME, TAG } from "@/consts.js";
import { getLogger } from "logtape";
import { honoLogger } from "logtape-hono";
import { effect } from "preact-signals-core";
import * as v from "valibot";

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

export function createHono({ store, logic, chessApi }) {
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
    .post(
      "*",
      honoLogger({
        category: [APP_NAME, "hono"],
        logRequest: true,
        format: "dev",
      }),
    )
    .post(
      "/tourndate/:dir",
      vali(
        "param",
        v.object({ dir: v.picklist(["prev", "last", "next"]) }),
        (r, c) => {
          if (!r.success) return badRequest(c);
        },
      ),
      async (c) => {
        logic.changeTournDate(c.req.valid("param").dir);
        const games = await chessApi.getGames(store.tournDate.value);
        logic.updateTourResults(games);
        return noContent(c);
      },
    )
    .post("/refresh", async (c) => {
      const games = await chessApi.getGames(store.tournDate.value);
      logic.updateTourResults(games);
      return noContent(c);
    })
    .post("/watch", (c) => {
      logic.toggleWatchMode();
      return noContent(c);
    })
    .post("/prize", (c) => {
      logic.togglePrize();
      return noContent(c);
    })
    .post(
      "/bonus/:dir?",
      vali(
        "param",
        v.object({ dir: v.optional(v.picklist(["minus", "plus"])) }),
        (r, c) => {
          if (!r.success) return badRequest(c);
        },
      ),
      (c) => {
        const dir = c.req.valid("param").dir;
        if (dir) {
          logic.changeBonusAmount(dir);
        } else {
          logic.toggleBonus();
        }
        return noContent(c);
      },
    );

  const widget = new Hono()
    .basePath("/widget")
    .get(
      "/",
      (c) => c.html(SSR("widget", store.clientify())),
    );

  const hono = new Hono()
    .use(trimTrailingSlash())
    .use(serveStatic({ root: "./public" }))
    .get("/", (c) => c.redirect("/dashboard"))
    .route("/", dashboard)
    .route("/", widget)
    .get("/sse", (c) => {
      return streamSSE(c, (s) => {
        const unsub = effect(() =>
          !s.aborted && s.writeSSE({ data: JSON.stringify(store.clientify()) })
        );
        logger.debug("Add new SSE connection");

        s.onAbort(() => {
          unsub();
          logger.debug("Del SSE connection on abort");
        });

        return new Promise(emptyFn);
      });
    });

  return hono;
}
