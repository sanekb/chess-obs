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

  return <App />

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


const Background = () => (
  <div class="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-50">

    <div class="absolute top-10 left-10 grid grid-cols-4 gap-2 text-[#52668d] opacity-75 text-xl">
      {[...Array(16)].map((_, i) => <span key={i}>•</span>)}
    </div>
    <div class="absolute top-10 right-10 grid grid-cols-4 gap-2 text-[#52668d] opacity-75 text-xl">
      {[...Array(16)].map((_, i) => <span key={i}>•</span>)}
    </div>
    
    <div class="absolute top-8 left-16 w-8 h-8 border border-[#52668d] rotate-45 rounded-sm"></div>
    <div class="absolute bottom-24 right-12 w-10 h-10 border border-[#52668d] rounded-md opacity-60"></div>
    
    <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-[#2e3d5c] rounded-full filter blur-3xl opacity-30"></div>
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-[#2e3d5c] rounded-full filter blur-3xl opacity-30"></div>
  
  </div>
);

const Header = () => (
  <header class="text-center space-y-3 z-10">
    <h1 class="text-3xl font-bold tracking-wide text-white select-none">
      chess obs
    </h1>
    <div class="text-[#a3b8cc] text-sm max-w-sm mx-auto leading-relaxed space-y-1">
      <p>тут будет текст</p>
      <p>короткая инструкция</p>
      <p>описание че это такое</p>
      <p class="text-blue-400 font-mono">{"{member}"}</p>
    </div>
  </header>
);

const Button = ({ children }) => (
	<button class="px-2 h-8 flex items-center justify-center rounded-lg border-2 border-[#52668d] text-white text-sm font-semibold transition-all duration-200 hover:bg-[#2e3d5c] hover:border-blue-400 hover:scale-105 active:scale-95 cursor-pointer">
        { children }
    </button>
);

const Span = ({ children }) => <span class="text-xs text-[#52668d] font-mono tracking-wider">{ children }</span>

const Controls = () => (
  <div class="flex flex-wrap items-center justify-center gap-6 z-10 select-none">

    <div class="flex flex-col items-center gap-1">
      <div class="flex items-center gap-1">
      	<Button>&lt;</Button>
      	<Button>0</Button>
      	<Button>&gt;</Button>
      </div>
      <Span>12345667</Span>
    </div>

    <div class="flex flex-col items-center gap-1">
      <Button>Обновить</Button>
      <Span>Обновлено</Span>
    </div>

    <div class="flex flex-col items-center gap-1">
      <Button>Авто</Button>
      <Span>выключено</Span>
    </div>
  </div>
);

const Iframe = () => (
  <div class="w-full max-w-xl flex flex-col gap-2 z-10">

    <div class="w-full h-10 rounded-xl border-1 border-blue-500/80 bg-[#161f30] flex items-center justify-center transition-all duration-200 hover:border-blue-400
    	text-sm tracking-wider text-blue-400/70 select-all font-mono">
        https://chess-obs.sanekb.deno.dev/widget
    </div>

    <div class="w-full aspect-video rounded-2xl border-1 border-blue-500/80 bg-[#161f30] flex items-center justify-center relative overflow-hidden">
      <span class="text-xl font-medium tracking-widest text-blue-400/80 select-none transition-transform duration-300">
        iframe
      </span>
      {/*<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />*/}
    </div>

  </div>
);

const Footer = () => (
  <footer class="text-center space-y-1 text-xs text-[#52668d] mt-auto z-10 select-none">
    <p class="cursor-default">Сделано специально для Матвея</p>
    <p>
      исходный <a class="underline font-mono opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-pointer" href="https://github.com/sanekb/chess-obs">код</a> на всякий случай
    </p>
  </footer>
);

const App = () => {
  return (
    <div class="relative min-h-screen bg-[#1e2942] text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">

      <Background />

      <div class="w-full max-w-2xl flex-1 flex flex-col items-center justify-start gap-10">
        <Header />
        <Controls />
        <Iframe />
        <Footer />
      </div>
    </div>
  );
};