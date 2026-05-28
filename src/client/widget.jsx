import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { clsx } from "clsx";

export default function Widget({ state }) {
  const counter = useSignal(state.mockCounter ?? 0);

  useEffect(() => {
    const eventSource = new EventSource(`/widget/${state.widgetId}/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      counter.value = data.counter;
    };
  }, []);

  return (
    <div class="container">
      Счётчик: <span id="counter">{counter.value}</span>
    </div>
  );
}
