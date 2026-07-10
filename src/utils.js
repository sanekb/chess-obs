import { LOCALE, ZONE } from "@/consts.js";

export const now = () => performance.now();
export const today = () => Temporal.Now.plainDateTimeISO(ZONE);

export const localDate = (dt) => dt.toPlainDate().toLocaleString(LOCALE);

export function getLastTournDate() {
  const date = today();
  const toSubt = [0, 4, 0, 1, 0, 1, 2, 3];

  return date.subtract({ days: toSubt[date.dayOfWeek] });
}
