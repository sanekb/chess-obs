const cache = new Map();

export const plugin304 = {
  id: "plugin304",
  name: "plugin304",
  hooks: {
    onRequest(ctx) {
      if (cache.has(ctx.url.href)) {
        const res = cache.get(ctx.url.href);
        ctx.headers.set("If-None-Match", res.headers.get("ETag"));
        ctx.headers.set("If-Modified-Since", res.headers.get("Last-Modified"));
      }
      return ctx;
    },
    onResponse(ctx) {
      const { request: req, response: res } = ctx;
      if (res.status === 304) {
        return cache.get(req.url.href).clone();
      }
      if (res.status === 200) {
        cache.set(req.url.href, res.clone());
      }
      return res;
    },
  },
};

Deno.cron("Daily cache clear", "0 0 * * *", () => cache.clear());
