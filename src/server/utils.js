import { loadSync } from "@std/dotenv";
import { toCamelCase } from "@std/text";

export const env = Object.fromEntries(
  Object.entries(loadSync()).map(
    ([k, v]) => [toCamelCase(k), v],
  ),
);

export const noContent = (c) => c.body(null, 204);
export const emptyFn = () => {};

export const compat = (value) => ({ value });

export {
  getLastTournDate,
  isGreaterThan,
  isThursday,
  isTournDay,
  isTournTime,
  isTuesday,
  now,
  today,
} from "@/utils.js";

export function getTournUrlRegExp(date) {
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

  const month = monthFormatter.format(date).toLowerCase();
  const day = String(date.day).padStart(2, "0");
  const year = date.year;

  return new RegExp(
    `(?:tuesday|thursday)-(?:[\\w\\-]*)(?:${month}-${day}-${year})-(?:\\d+)`,
  );
}
