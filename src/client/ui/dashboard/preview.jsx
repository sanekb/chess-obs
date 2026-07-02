export function Preview({ src }) {
  return (
    <section class="w-full max-w-[492px] flex flex-col gap-2 z-10">
      <div class="h-10 rounded-lg border-1 border-secondary-200 hover:border-secondary-100 bg-surface-200 flex items-center justify-center transition-all duration-150 tracking-wider text-secondary-100 hover:text-primary select-all font-mono">
        {new URL("/widget", location.origin).href}
      </div>

      <div class="aspect-[492/342] rounded-lg border-1 border-secondary-200 bg-surface-200 flex items-center justify-center relative ">
        <iframe src={src} class="w-full h-full" />
      </div>
    </section>
  );
}
