import { clsx } from "clsx";

export function Button({ onclick, active = false, children }) {
  const base =
    "px-2 h-8 flex items-center justify-center rounded-lg border-2 border-grey-200 text-milk font-semibold transition-all duration-200 hover:bg-grey-300 hover:border-blue-400 hover:scale-105 active:scale-95 cursor-pointer";
  const style = clsx(base, {
    "bg-grey-300": active,
  });

  return (
    <button type="button" onclick={onclick} class={style}>
      {children}
    </button>
  );
}

export function Span({ children }) {
  return (
    <span class="text-xs text-grey-200 font-mono tracking-wider">
      {children}
    </span>
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
