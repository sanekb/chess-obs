import { loadSync } from "@std/dotenv";
import { toCamelCase } from "@std/text";

export const emptyFn = () => {};

export const now = () => performance.now();

export const compat = (value) => ({ value });

export const env = Object.fromEntries(
  Object.entries(loadSync()).map(
    ([k, v]) => [toCamelCase(k), v],
  ),
);

export const nocontent = (c) => c.body(null, 204);

export const isThursday = (pd) => pd.dayOfWeek === 4;
export const isGreaterThan = (pd1, pd2) =>
  Temporal.PlainDate.compare(pd1, pd2) > 0;

export function getLastTournDate() {
  const today = Temporal.Now.plainDateISO();
  const days = [0, 4, 0, 1, 0, 1, 2, 3][today.dayOfWeek];

  return today.subtract({ days });
}

export function getArchiveDateTouple(date) {
  const year = String(date.year);
  const month = String(date.month).padStart(2, "0");

  return { year, month };
}

export function getTournUrlRegExp(date) {
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

  const month = monthFormatter.format(date).toLowerCase();
  const day = String(date.day).padStart(2, "0");
  const year = date.year;

  return new RegExp(`${month}-${day}-${year}`);
}
