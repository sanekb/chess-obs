import { useEffect, useMemo } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { clsx } from "clsx";
import { pricePerWin } from "../consts.js";

function hop(stats) {
  const tours = [];

  for (let i = 1; i <= 6; i++) {
    tours.push({ i: i + 0, r: stats[i + 0 - 1] ?? '*' });
    tours.push({ i: i + 6, r: stats[i + 6 - 1] ?? '*' });
  }
  tours.pop();

  return {
    tours,
    price: tours.reduce(
      (p, t) => p + (t.r !== '*' ? t.r * pricePerWin : 0),
      0,
    ),
  };
}

export default function Widget({ state }) {
  const gg = useMemo(() => hop([]), []);
  const ggwp = useSignal(gg);

  useEffect(() => {
    const eventSource = new EventSource(`/widget/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const stats = data.stats;
      const _ggwp = hop(stats);

      ggwp.value = _ggwp;
    };
  }, []);

  const { tours, price } = ggwp.value;

  return (
    <div class="flex flex-col gap-y-4 p-6 font-sans uppercase">
      <div class="grid grid-cols-2 gap-x-8 gap-y-1 text-lg text-milk font-semibold">
        {tours.map((t) =>
          t.r === '*'
            ? <div>{t.i} тур - *, 0р</div>
            : <div>{t.i} тур - {t.r}, {t.r * pricePerWin}р</div>
        )}
      </div>
      <div class="col-span-2 text-accent text-3xl font-black">
        Приз: {price} р
      </div>
    </div>
  );
}
