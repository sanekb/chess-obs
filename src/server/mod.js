import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";

import { app as dashboard } from "./routes/dashboard.js";
import { app as widget } from "./routes/widget.js";

const app = new Hono();

app.use("*", serveStatic({ root: "./public" }));

app.get("/", (c) => c.redirect("/dashboard") )
app.route("/", dashboard);
app.route("/", widget);

Deno.serve({ port: 8000 }, app.fetch);
