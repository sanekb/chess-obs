import { today } from "@/utils.js";
import { loadSync } from "@std/dotenv";
import { toCamelCase } from "@std/text";
import { TOURN_START_TIME } from "@/consts.js";

export const env = Object.fromEntries(
  Object.entries(loadSync()).map(
    ([k, v]) => [toCamelCase(k), v],
  ),
);

export const sep = "\u001f";

export const noContent = (c) => c.body(null, 204);
export const badRequest = (c) => c.body(null, 400);
export const emptyFn = () => {};

export const compat = (value) => ({ value });

export const isTuesday = (dt) => dt.dayOfWeek === 2;
export const isThursday = (dt) => dt.dayOfWeek === 4;

export const isTournMoment = () => {
  const dt = today();
  const mt = dt.toPlainTime();
  const tt = TOURN_START_TIME;
  return (isTuesday(dt) || isThursday(dt)) &&
    (mt.hour === tt.hour && mt.minute === tt.minute);
};

export const isGreaterThan = (dt1, dt2) =>
  Temporal.PlainDateTime.compare(dt1, dt2) > 0;

export function getTournUrlRegExp(date) {
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

  const month = monthFormatter.format(date).toLowerCase();
  const day = String(date.day).padStart(2, "0");
  const year = date.year;

  return new RegExp(
    `(?:tuesday|thursday)-(?:[\\w\\-]*)(?:${month}-${day}-${year})-(?:\\d+)`,
  );
}

export * from "@/utils.js";
