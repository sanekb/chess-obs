import { hc } from "@hono/hono/client";

export const api = hc("/dashboard");

export const asJson = (requestPromise) => requestPromise.then((r) => r.json());
