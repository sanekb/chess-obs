import { clsx } from "clsx";

export function Button(
  { onclick, active = false, disabled = false, children },
) {
  const style = clsx(
    "px-2 h-8 flex items-center justify-center rounded-lg",
    "transition-all duration-150",
    "bg-surface-100 border-2 font-semibold",
    {
      "border-secondary-300 text-primary/75 cursor-default": disabled,

      "border-secondary-200 text-primary cursor-pointer": !disabled,
      "hover:bg-secondary-300 hover:border-accent-blue hover:scale-105 active:scale-99":
        !disabled,
      "bg-secondary-300": active,
    },
  );

  return (
    <button type="button" onclick={!disabled && onclick} class={style}>
      {children}
    </button>
  );
}

export function Span({ children }) {
  return (
    <span class="text-xs text-secondary-200">
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
