import { Hono } from "@hono/hono";
import { streamSSE } from "@hono/hono/streaming";
import state from "../state.js";
import { html } from "../layout.js";



const streams = new Set();

export async function notify () {

	const data = JSON.stringify({ stats: state.stats });

    for (const stream of streams) {
      await stream.writeSSE({ data });
    }

}




export const app = new Hono()

.basePath("/widget")

.get(
  "/",
  (c) =>
    c.html(
      html({
        page: "widget",
        stats: state.stats,
      }),
    ),
)

.get("/sse", (c) => {
  return streamSSE(c, async (s) => {
    streams.add(s);

    s.onAbort(() => streams.delete(s));

    return new Promise(() => {});
  });
});
