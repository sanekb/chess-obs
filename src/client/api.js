import { store } from "@/client/store.js";
import { RECONNECT_DELAYS } from "@/consts.js";
import { createFetch, createSchema } from "better-fetch";
import { nocontentSchema } from "@/client/utils.js";

const chessSchema = createSchema({
  "/change/:dir": {
    method: "post",
    output: nocontentSchema,
  },
  "/refresh": {
    method: "post",
    output: nocontentSchema,
  },
  "/watch": {
    method: "post",
    output: nocontentSchema,
  },
  "/bonus": {
    method: "post",
    output: nocontentSchema,
  },
  "/prize": {
    method: "post",
    output: nocontentSchema,
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
