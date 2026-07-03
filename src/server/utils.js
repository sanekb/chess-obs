import { loadSync } from "@std/dotenv";
import { toCamelCase } from "@std/text";

export const env = Object.fromEntries(
  Object.entries(loadSync()).map(
    ([k, v]) => [toCamelCase(k), v],
  ),
);
