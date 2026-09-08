import { LOCALE, TOURN_START_TIME, ZONE } from "@/consts.js";

export const noRes = "?";

export const now = () => performance.now();
export const today = () =>
  Temporal.Now.plainDateTimeISO(ZONE).round({
    smallestUnit: "minute",
    roundingMode: "halfExpand",
  });

export const localDate = (dt) => dt.toPlainDate().toLocaleString(LOCALE);

export function getLastTournDate() {
  const date = today().withPlainTime(TOURN_START_TIME);
  const toSubt = [0, 4, 0, 1, 0, 1, 2, 3];

  return date.subtract({ days: toSubt[date.dayOfWeek] });
}
