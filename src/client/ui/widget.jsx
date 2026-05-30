import { useEffect } from "preact/hooks";
import { store } from "@/client/app-store.js";
import { PRIZE_FOR_TOP, PRIZE_PER_WIN } from "@/consts.js";

function prepareForGrid(gameResults) {
  const tours = [];

  for (let i = 1; i <= 6; i++) {
    tours.push({ i: i + 0, r: gameResults[i + 0 - 1] ?? "*" });
    tours.push({ i: i + 6, r: gameResults[i + 6 - 1] ?? "*" });
  }
  tours.pop();

  return {
    tours,
    prize: tours.reduce(
      (p, t) => p + (t.r !== "*" ? t.r * PRIZE_PER_WIN : 0),
      0,
    ),
  };
}

export default function Widget({ state }) {
  useEffect(() => store.parse(state), []);

  const { isBonusEnabled, isPrizeEnabled, gameResults } = store;
  const { tours, prize } = prepareForGrid(gameResults.value);

  return (
    <div class="flex flex-col gap-y-4 p-6 font-sans uppercase">
      <div class="grid grid-cols-2 gap-x-8 gap-y-1 text-lg text-milk font-semibold">
        {tours.map((t) =>
          t.r === "*"
            ? <div>{t.i} тур - *{isPrizeEnabled.value ? ", 0р" : ""}</div>
            : (
              <div>
                {t.i} тур - {t.r}
                {isPrizeEnabled.value ? `, ${t.r * PRIZE_PER_WIN}р` : ""}
              </div>
            )
        )}
      </div>
      {isPrizeEnabled.value && (
        <div class="col-span-2 text-accent text-3xl font-black">
          Приз: {prize + (isBonusEnabled.value ? PRIZE_FOR_TOP : 0)} р
        </div>
      )}
    </div>
  );
}
