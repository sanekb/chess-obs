export const env = {
  playerName: Deno.env.get("PLAYER_NAME"),
  playerPassword: Deno.env.get("PLAYER_PASSWORD"),

  devEmail: Deno.env.get("DEV_EMAIL"),
  devPassword: Deno.env.get("DEV_PASSWORD"),
};
