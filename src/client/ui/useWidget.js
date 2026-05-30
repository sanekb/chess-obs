import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { pricePerWin } from "@/consts.js";

function prepareForGrid(stats) {
  const tours = [];

  for (let i = 1; i <= 6; i++) {
    tours.push({ i: i + 0, r: stats[i + 0 - 1] ?? "*" });
    tours.push({ i: i + 6, r: stats[i + 6 - 1] ?? "*" });
  }
  tours.pop();

  return {
    tours,
    price: tours.reduce(
      (p, t) => p + (t.r !== "*" ? t.r * pricePerWin : 0),
      0,
    ),
  };
}

export function useWidget(state) {
  const gridContent = useSignal(prepareForGrid(state.stats));
  const isApplyBonus = useSignal(state.bonus);

  useEffect(() => {
    const eventSource = new EventSource(`/widget/sse`);

    eventSource.onmessage = (event) => {
      const { stats, bonus } = JSON.parse(event.data);
      gridContent.value = prepareForGrid(stats);
      isApplyBonus.value = bonus;
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return {
    gridContent,
    isApplyBonus,
  };
}
