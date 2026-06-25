import { store } from "@/client/store.js";
import { PRIZE_FOR_GMs, PRIZE_FOR_TOP, PRIZE_PER_WIN } from "@/consts.js";
import { Draw, Loss, Win } from "@/client/ui/icons.jsx";
import { cn } from "@/utils.js";

const prize = (g) => g ? PRIZE_FOR_GMs : PRIZE_PER_WIN;

function prepareForGrid(gameResults) {
  const last = gameResults.length;
  const tours = [];
  const push = (i) => {
    const [r, g] = gameResults[i - 1] ?? ["*", false];
    tours.push({
      i,
      r,
      g,
      l: i === last,
    });
  };

  for (let i = 1; i <= 6; i++) {
    push(i + 0);
    push(i + 6);
  }
  tours.pop();

  return {
    tours,
    prize: tours.reduce(
      (p, t) => p + (t.r !== "*" ? t.r * prize(t.g) : 0),
      0,
    ),
  };
}

const Icon = ({ t }) => {
  if (t.r === 1) return <Win />;
  if (t.r === 0.5) return <Draw />;
  if (t.r === 0) return <Loss />;
  return null;
};

const Res = ({ t, p }) => {
  return t.r === "*"
    ? <span class="ml-3">*{p.value ? ", 0₽" : ""}</span>
    : (
      <span
        class={cn("flex items-center ml-1.5", { "animate-fade-in": t.l })}
      >
        <Icon t={t} />
        <span>{p.value ? `, ${t.r * prize(t.g)}₽` : ""}</span>
      </span>
    );
};

const Tour = ({ t, p }) => {
  return (
    <div class="flex">
      <span class="w-[calc(2.35lh)] md:w-[calc(2.4lh)] lg:w-[calc(2.45lh)] xl:w-[calc(2.5lh)] text-end shrink-0">
        {t.i} тур:
      </span>
      <Res t={t} p={p} />
    </div>
  );
};

export default function Widget() {
  const { isBonusEnabled, isPrizeEnabled, gameResults } = store;
  const { tours, prize } = prepareForGrid(gameResults.value);

  return (
    <div class="p-2 sm:p-3 xl:p-4 flex flex-col gap-y-4 uppercase">
      <div
        class={cn(
          "grid grid-cols-2 text-primary font-semibold font-montserrat tracking-tighter",
          "text-md sm:text-lg md:text-xl xl:text-2xl",
          " gap-y-1 xl:gap-y-2",
          {
            "gap-x-2 sm:gap-x-4 md:gap-x-5 xl:gap-x-6": isPrizeEnabled.value,
          },
        )}
      >
        {tours.map((t) => <Tour t={t} p={isPrizeEnabled} />)}
      </div>
      {isPrizeEnabled.value && (
        <div class="px-2 text-accent-orange text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-montserrat font-bold">
          Приз: {prize + (isBonusEnabled.value ? PRIZE_FOR_TOP : 0)}₽
        </div>
      )}
    </div>
  );
}
