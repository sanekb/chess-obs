import { hc } from "hono/client";
import { store } from "@/client/store.js";
import { RECONNECT_DELAYS } from "@/consts.js";

export const api = hc("/dashboard");

let es = null;
let attempt = 0;
let reconnectTimer = null;

export function connectSSE() {
  if (es) es.close();

  es = new EventSource(`/sse`);
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
