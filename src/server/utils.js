import { loadSync } from "@std/dotenv";
import { toCamelCase } from "@std/text";

export const env = Object.fromEntries(
  Object.entries(loadSync()).map(
    ([k, v]) => [toCamelCase(k), v],
  ),
);

export function getLastTournamentDate() {
  const today = Temporal.Now.plainDateISO();

  const daysToSubtract = [0, 4, 0, 1, 0, 1, 2, 3][today.dayOfWeek];

  return today.subtract({ days: daysToSubtract });
}

export function getTournamentRegExp(date) {
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

  const month = monthFormatter.format(date).toLowerCase();
  const day = String(date.day).padStart(2, "0");
  const year = date.year;

  return new RegExp(`${month}-${day}-${year}`);
  // return new RegExp(`july-02-2026`);
}

export function getChessArchUrlDate(date) {
  const year = String(date.year);
  const month = String(date.month).padStart(2, "0");

  return { year, month };
}
