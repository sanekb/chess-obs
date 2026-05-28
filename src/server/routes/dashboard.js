import { Hono } from "@hono/hono";
import { basicAuth } from "@hono/hono/basic-auth";
import state from "../state.js";
import { html } from "../layout.js";
import { env } from "../env.js";

const app = new Hono().basePath("/dashboard");

app.use(
  "*",
  basicAuth({
    username: env.user,
    password: env.pass,
  }),
);

app.get("/", (c) =>
  c.html(
    html({
      page: "dashboard",
      member: env.member,
      interval: env.interval,
      enabled: state.enabled,
      widgetId: state.widgetId,
    }),
  ));

app.post("/toggle", (c) => {
  state.enabled = !state.enabled;
  return c.json({ enabled: state.enabled });
});

app.post("/regenerate", (c) => {
  state.widgetId = "456";
  return c.json({ widgetId });
});

export { app };
