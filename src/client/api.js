import { store } from "@/client/store.js";
import { RECONNECT_DELAYS } from "@/consts.js";
import { createFetch, createSchema } from "better-fetch";
import { noContentSchema } from "@/client/utils.js";

const chessSchema = createSchema({
  "/change/:dir": {
    method: "post",
    output: noContentSchema,
  },
  "/refresh": {
    method: "post",
    output: noContentSchema,
  },
  "/watch": {
    method: "post",
    output: noContentSchema,
  },
  "/bonus": {
    method: "post",
    output: noContentSchema,
  },
  "/prize": {
    method: "post",
    output: noContentSchema,
  },
});

export const $fetch = createFetch({
  baseURL: new URL("/dashboard", location.origin).href,
  schema: chessSchema,
  catchAllError: true,
});

let es = null;
let attempt = 0;
let reconnectTimer = null;

export function connectSSE() {
  if (es) es.close();

  es = new EventSource("/sse");
  es.onopen = () => {
    attempt = 0;
  };
  es.onmessage = (event) => {
    store.parse(JSON.parse(event.data));
  };
  es.onerror = () => {
    es.close();

    const delay = RECONNECT_DELAYS[attempt++] ??
      RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1];

    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connectSSE();
    }, delay);
  };
}
