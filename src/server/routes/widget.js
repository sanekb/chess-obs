import { Hono } from "@hono/hono";
import { streamSSE } from "@hono/hono/streaming";
import state from "../state.js";
import { html } from "../layout.js";

const streams = new Set();

setInterval(() => {
  state.mockCounter++;

  if (state.enabled) {
    const payload = JSON.stringify({ counter: state.mockCounter });

    for (const stream of streams) {
      stream.writeSSE({ data: payload });
    }
  }
}, 1000);

const app = new Hono().basePath("/widget");

app.use("/:wid", async (c, next) => {
  if (c.req.param("wid") !== state.widgetId) {
    return c.notFound();
  }
  await next();
});

app.get(
  "/:wid",
  (c) =>
    c.html(
      html({
        page: "widget",
        mockCounter: state.mockCounter,
        widgetId: state.widgetId,
      }),
    ),
);

app.get("/:wid/sse", (c) => {
  return streamSSE(c, async (s) => {
    streams.add(s);

    s.onAbort(() => streams.delete(s));

    return new Promise(() => {});
  });
});

export { app };
