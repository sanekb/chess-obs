import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as v from "valibot";
import { PRIZE_FOR_GMs, PRIZE_PER_WIN } from "@/consts.js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const nocontentSchema = v.literal("");

export const nbsp = { text: "\u00A0" };
export const noRes = "*";

export function getLastTournDate() {
  const date = Temporal.Now.plainDateISO();
  const toSubt = [0, 4, 0, 1, 0, 1, 2, 3];
  const lastTD = date.subtract({ days: toSubt[date.dayOfWeek] });
  return lastTD.toLocaleString();
}

export const prize = (g) => g ? PRIZE_FOR_GMs : PRIZE_PER_WIN;

export function prepareForGrid(tourResults) {
  const tours = [];
  const last = tourResults.length;
  const push = (i) => {
    const [r, g] = tourResults[i - 1] ?? [noRes, false];
    tours.push({ i, r, g, l: i === last });
  };

  for (let i = 1; i <= 6; i++) {
    push(i + 0);
    push(i + 6);
  }
  tours.pop();

  return {
    tours,
    prize: tours.reduce(
      (p, t) => p + (t.r !== noRes ? t.r * prize(t.g) : 0),
      0,
    ),
  };
}
