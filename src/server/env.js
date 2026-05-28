export const env = {
  user: Deno.env.get("AUTH_USERNAME"),
  pass: Deno.env.get("AUTH_PASSWORD"),

  member: Deno.env.get("MEMBER"),
  interval: parseInt(Deno.env.get("INTERVAL")),
};
