import { useSignal } from "@preact/signals";
import { clsx } from "clsx";
import { hc } from "@hono/hono/client";

export default function Dashboard({ state }) {

  const watch = useSignal(state.watch ?? false);
  const lastGameId = useSignal(state.lastGameId ?? 0);
  const member = state.member;
  const refresh = useSignal(false);
  const refreshTimer = useSignal(0);


  const client = hc("/dashboard");

  async function _offset ( off ) {

    const res = await client.offset[':off'].$post( {param: {off: String(off)}} )
    const json = await res.json();

    lastGameId.value = json.lastGameId;
  }

  async function _watch() {
    const res = await client.watch.$post();
    const json = await res.json();

    watch.value = json.watch;

    if ( watch.value ) setTimeout( () => watch.value = false, 1 * 1 * 10e3);
  }

  async function _refresh() {
    const res = await client.refresh.$post();
    const json = await res.json();

    clearTimeout( refreshTimer.value );

    refresh.value = json.refresh;
    refreshTimer.value = setTimeout( () => refresh.value = false, 2e3 )
  }

  return (
    <>
      <h1>chess obs</h1>

      <button
        class={clsx("text-white", 'bg-gray-500')}
        onclick={ () => _offset( -1 ) }
      >
        {"<"}
      </button>
      <button
        class={clsx("text-white", 'bg-gray-500')}
        onclick={ () => _offset( 0 ) }
      >
        {"0"}
      </button>
      <button
        class={clsx("text-white", 'bg-gray-500')}
        onclick={ () => _offset( 1 ) }
      >
        {">"}
      </button>
      <div>{ lastGameId.value }</div>

      <button
        class={clsx("text-white", {
          "bg-red-500": watch.value,
          "bg-green-500": !watch.value,
        })}
        onclick={ _watch }
      >
        {watch.value ? "Стоп" : "Старт"}
      </button>
      <div>{watch.value ? "наблюдаю" : "--"}</div>


      <button
        class={clsx("text-white", 'bg-gray-500')}
        onclick={ _refresh }
      >
        Обновить
      </button>
      <div>{ refresh.value ? 'обновлено' : '' }</div>



      <iframe
        src="/widget"
        style="width:300px; height:200px; border: 1px solid blue"
      >
      </iframe>
    </>
  );
}
