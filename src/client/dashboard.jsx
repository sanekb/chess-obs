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

  async function _offset(off) {
    const res = await client.offset[":off"].$post({
      param: { off: String(off) },
    });
    const json = await res.json();

    lastGameId.value = json.lastGameId;
  }

  async function _watch() {
    const res = await client.watch.$post();
    const json = await res.json();

    watch.value = json.watch;

    if (watch.value) setTimeout(() => watch.value = false, 1 * 1 * 10e3);
  }

  async function _refresh() {
    const res = await client.refresh.$post();
    const json = await res.json();

    clearTimeout(refreshTimer.value);

    refresh.value = json.refresh;
    refreshTimer.value = setTimeout(() => refresh.value = false, 2e3);
  }

  return (
    <div class="relative min-h-screen bg-dark text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">
      <Background />

      <div class="w-full max-w-2xl flex-1 flex flex-col items-center justify-start gap-10">
        <Header member={member} />
        <Controls>
          <Control>
            <div class="flex items-center gap-1">
              <Button onclick={() => _offset(-1)}>&lt;</Button>
              <Button onclick={() => _offset(0)}>0</Button>
              <Button onclick={() => _offset(1)}>&gt;</Button>
            </div>
            <Span>{lastGameId.value}</Span>
          </Control>
          <Control>
            <Button onclick={_refresh}>Обновить</Button>
            <Span>{refresh.value ? "обновлено!" : "\u00A0"}</Span>
          </Control>
          <Control>
            <Button onclick={_watch} active={watch.value}>Авто</Button>
            <Span>{watch.value ? "работает" : "выключено"}</Span>
          </Control>
        </Controls>
        <Iframe src="/widget" />
        <Footer />
      </div>
    </div>
  );
}

const Background = () => (
  <div class="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-50">
    <div class="absolute top-10 left-10 grid grid-cols-4 gap-2 text-grey-3 opacity-75 text-xl">
      {[...Array(16)].map((_, i) => <span key={i}>•</span>)}
    </div>
    <div class="absolute top-10 right-10 grid grid-cols-4 gap-2 text-grey-3 opacity-75 text-xl">
      {[...Array(16)].map((_, i) => <span key={i}>•</span>)}
    </div>

    <div class="absolute top-8 left-16 w-8 h-8 border border-grey-3 rotate-45 rounded-sm">
    </div>
    <div class="absolute bottom-24 right-12 w-10 h-10 border border-grey-3 rounded-md opacity-60">
    </div>

    <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-grey rounded-full filter blur-3xl opacity-30">
    </div>
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-grey rounded-full filter blur-3xl opacity-30">
    </div>
  </div>
);

const Header = ({ member }) => (
  <header class="text-center space-y-3 z-10">
    <h1 class="text-3xl font-bold tracking-wide text-white select-none">
      chess-obs
    </h1>
    <div class="text-grey-2 text-sm max-w-sm mx-auto leading-relaxed space-y-1">
      <p>тут будет текст</p>
      <p>короткая инструкция</p>
      <p>описание че это такое</p>
      <p class="text-blue-400 font-mono">{member}</p>
    </div>
  </header>
);

const Button = ({ onclick, active, children }) => {
  const base =
    "px-2 h-8 flex items-center justify-center rounded-lg border-2 border-grey-3 text-white text-sm font-semibold transition-all duration-200 hover:bg-grey hover:border-blue-400 hover:scale-105 active:scale-95 cursor-pointer";
  const style = clsx(base, {
    "bg-grey": active,
  });

  return (
    <button onclick={onclick} class={style}>
      {children}
    </button>
  );
};

const Span = ({ children }) => (
  <span class="text-xs text-grey-3 font-mono tracking-wider">{children}</span>
);

const Control = ({ children }) => (
  <div class="flex flex-col items-center gap-1">{children}</div>
);

const Controls = ({ children }) => (
  <div class="flex flex-wrap items-center justify-center gap-6 z-10 select-none">
    {children}
  </div>
);

const Iframe = ({ src }) => (
  <div class="w-full max-w-xl flex flex-col gap-2 z-10">
    <div class="w-full h-10 rounded-xl border-1 border-blue-500/80 bg-dark-2 flex items-center justify-center transition-all duration-200 hover:border-blue-400
    	text-sm tracking-wider text-blue-400/70 select-all font-mono">
      https://chess-obs.sanekb.deno.dev/widget
    </div>

    <div class="w-full aspect-video rounded-2xl border-1 border-blue-500/80 bg-dark-2 flex items-center justify-center relative overflow-hidden">
      <iframe src={src} class="w-full h-full" />
    </div>
  </div>
);

const Footer = () => (
  <footer class="text-center space-y-1 text-sm text-grey-3 mt-auto z-10 select-none">
    <p class="cursor-default">Сделано специально для Матвея</p>
    <p>
      исходный{" "}
      <a
        class="underline font-mono opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        href="https://github.com/sanekb/chess-obs"
      >
        код
      </a>{" "}
      на всякий случай
    </p>
  </footer>
);

const App = () => {
  return (
    <div class="relative min-h-screen bg-dark text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">
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
