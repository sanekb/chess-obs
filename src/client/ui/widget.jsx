import { store } from "@/client/app-store.js";
import { PRIZE_FOR_TOP, PRIZE_PER_WIN } from "@/consts.js";
import { Draw, Loss, Win } from "@/client/lib/icons.jsx";
import { clsx } from "clsx";

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

const Icon = ({ r }) => {
  if (r === 1) return <Win />;
  if (r === 0.5) return <Draw />;
  if (r === 0) return <Loss />;
  return null;
};

export default function Widget() {
  const { isBonusEnabled, isPrizeEnabled, gameResults } = store;
  const { tours, prize } = prepareForGrid(gameResults.value);

  return (
    <div class="p-2 sm:p-4 flex flex-col gap-y-4 uppercase">
      <div
        class={clsx(
          "grid grid-cols-2 gap-y-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-sans text-milk font-bold",
          {
            "gap-x-8": isPrizeEnabled.value,
          },
        )}
      >
        {tours.map((t) => (
          <div class="flex items-center">
            {t.i < 10 && <span class="text-transparent">1</span>}
            {t.i} тур: {t.r === "*" && `*${isPrizeEnabled.value ? ", 0р" : ""}`}
            {t.r !== "*" && (
              <>
                <Icon r={t.r} />
                {isPrizeEnabled.value ? `, ${t.r * PRIZE_PER_WIN}р` : ""}
              </>
            )}
          </div>
        ))}
      </div>
      {isPrizeEnabled.value && (
        <div class="text-accent text-2xl sm:text-4xl md:text-5xl font-montserrat font-bold">
          Приз: {prize + (isBonusEnabled.value ? PRIZE_FOR_TOP : 0)} р
        </div>
      )}
    </div>
  );
}
