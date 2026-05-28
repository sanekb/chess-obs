import { useSignal } from "@preact/signals";
import { clsx } from "clsx";
import { hc } from "@hono/hono/client";

export default function Dashboard({ state }) {
  const enabled = useSignal(state.enabled ?? false);
  const widgetId = useSignal(state.widgetId ?? 0);

  console.log(`следит за ${state.member} каждые ${state.interval} сек`);

  const client = hc("/dashboard");

  async function req() {
    const res = await client.toggle.$post();
    const json = await res.json();

    enabled.value = json.enabled;
  }

  return (
    <>
      <h1>Управление виджетом</h1>
      <p>
        Статус трансляции данных:{" "}
        <strong>{enabled.value ? "ВКЛ" : "ВЫКЛ"}</strong>
      </p>

      <button
        class={clsx("text-white", {
          "bg-red-300": enabled.value,
          "bg-green-300": !enabled.value,
        })}
        onclick={req}
      >
        {enabled.value ? "Выключить" : "Включить"}
      </button>

      <iframe
        src={`/widget/${widgetId.value}`}
        style="width:300px; height:200px; border: 1px solid blue"
      >
      </iframe>
    </>
  );
}
