import { loadSync } from "@std/dotenv";
import { toCamelCase } from "@std/text";

export const env = Object.fromEntries(
  Object.entries(loadSync()).map(
    ([k, v]) => [toCamelCase(k), v],
  ),
);

export const nocontent = (c) => c.body(null, 204);
export const emptyFn = () => {};

export const compat = (value) => ({ value });

export const now = () => performance.now();
export const today = () => Temporal.Now.plainDateISO();
export const isTuesday = (pd) => pd.dayOfWeek === 2;
export const isThursday = (pd) => pd.dayOfWeek === 4;
export const isTournDay = (pd) => isTuesday(pd) || isThursday(pd);
export const isGreaterThan = (pd1, pd2) =>
  Temporal.PlainDate.compare(pd1, pd2) > 0;

export function getTournUrlRegExp(date) {
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

  const month = monthFormatter.format(date).toLowerCase();
  const day = String(date.day).padStart(2, "0");
  const year = date.year;

  // return new RegExp(`(?:tuesday|thursday)-(?:[\w\-]*)(?:${month}-${day}-${year})-(?:\d+)`);
  // return new RegExp(`${month}-${day}-${year}`);
  return new RegExp(`6609445`);
}
