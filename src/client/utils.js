import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as v from "valibot";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const nocontentSchema = v.literal("");

export const nbsp = { text: "\u00A0" };

export function getLastTournDate() {
  const date = Temporal.Now.plainDateISO();
  const toSubt = [0, 4, 0, 1, 0, 1, 2, 3];
  const lastTD = date.subtract({ days: toSubt[date.dayOfWeek] });
  return lastTD.toLocaleString();
}
