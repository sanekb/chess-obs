import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { clsx } from "clsx";

export default function Widget({ state }) {
  const stats = useSignal(state.stats ?? []);

  useEffect(() => {
    const eventSource = new EventSource(`/widget/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      stats.value = data.stats;
      console.log( stats.value );
    };
  }, []);

  return (
    <div class="flex flex-wrap">
      { stats.value.map( e => {

      	if ( e === 1 ) return <div class="w-5 h-5 m-1 bg-green-500"></div>
      	if ( e === 0 ) return <div class="w-5 h-5 m-1 bg-red-500"></div>
      	if ( e ===.5 ) return <div class="w-5 h-5 m-1 bg-gray-500"></div>
      	
      	return <div class="w-5 h-5 m-1 bg-purple-500"></div>

      }) }
    </div>
  );
}
