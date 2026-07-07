export const now = () => performance.now();
export const today = () => Temporal.Now.plainDateISO("UTC");

export const isGreaterThan = (pd1, pd2) =>
  Temporal.PlainDate.compare(pd1, pd2) > 0;

export const isTuesday = (pd) => pd.dayOfWeek === 2;
export const isThursday = (pd) => pd.dayOfWeek === 4;
export const isTournDay = (pd) => isTuesday(pd) || isThursday(pd);
export const isTournTime = () => Temporal.Now.plainTimeISO("UTC").hour >= 15;

export function getLastTournDate() {
  const date = today();
  const toSubt = [0, 4, 0, 1, 0, 1, 2, 3];

  return date.subtract({ days: toSubt[date.dayOfWeek] });
}
