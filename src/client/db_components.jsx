import { clsx } from "clsx";

export function Background() {
  return (
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
}

export function Header({ member }) {
  return (
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
}
export function Button({ onclick, active, children }) {
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
}

export function Span({ children }) {
  return (
    <span class="text-xs text-grey-3 font-mono tracking-wider">{children}</span>
  );
}

export function Control({ children }) {
  return <div class="flex flex-col items-center gap-1">{children}</div>;
}

export function Controls({ children }) {
  return (
    <div class="flex flex-wrap items-center justify-center gap-6 z-10 select-none">
      {children}
    </div>
  );
}

export function Iframe({ src }) {
  return (
    <div class="w-full max-w-xl flex flex-col gap-2 z-10">
      <div class="w-full h-10 rounded-xl border-1 border-blue-500/80 bg-dark-2 flex items-center justify-center transition-all duration-200 hover:border-blue-400
    	text-sm tracking-wider text-blue-400/70 select-all font-mono">
        https://chess-obs.mostik.dev/widget
      </div>

      <div class="w-full aspect-video rounded-2xl border-1 border-blue-500/80 bg-dark-2 flex items-center justify-center relative overflow-hidden">
        <iframe src={src} class="w-full h-full" />
      </div>
    </div>
  );
}

export function Footer() {
  return (
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
}
