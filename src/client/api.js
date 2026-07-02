import { store } from "@/client/store.js";
import { RECONNECT_DELAYS } from "@/consts.js";
import { createFetch, createSchema } from "better-fetch";
import * as v from "valibot";

const nullSchema = v.literal("");

const chessSchema = createSchema({
  "/offset/:off": {
    method: "post",
    output: nullSchema,
  },
  "/refresh": {
    method: "post",
    output: nullSchema,
  },
  "/watch": {
    method: "post",
    output: nullSchema,
  },
  "/bonus": {
    method: "post",
    output: nullSchema,
  },
  "/prize": {
    method: "post",
    output: nullSchema,
  },
});

export const api = createFetch({
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
