export const env = {
  user: Deno.env.get("AUTH_USERNAME"),
  pass: Deno.env.get("AUTH_PASSWORD"),

  playerName: Deno.env.get("PLAYER_NAME"),
  devEmail: Deno.env.get("DEV_EMAIL"),
};
