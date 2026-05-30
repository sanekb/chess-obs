import { useWidget } from "@/client/useWidget.js";
import { pricePerWin } from "@/consts.js";

export default function Widget({ state }) {
  const { gridContent, isApplyBonus } = useWidget(state);
  const { tours, price } = gridContent.value;

  return (
    <div class="flex flex-col gap-y-4 p-6 font-sans uppercase">
      <div class="grid grid-cols-2 gap-x-8 gap-y-1 text-lg text-milk font-semibold">
        {tours.map((t) =>
          t.r === "*"
            ? <div>{t.i} тур - *, 0р</div>
            : <div>{t.i} тур - {t.r}, {t.r * pricePerWin}р</div>
        )}
      </div>
      <div class="col-span-2 text-accent text-3xl font-black">
        Приз: {price + (isApplyBonus.value ? 10e3 : 0)} р
      </div>
    </div>
  );
}
