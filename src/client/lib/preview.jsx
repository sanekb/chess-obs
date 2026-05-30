export function Preview({ src }) {
  return (
    <div class="w-[490px] max-w-xl flex flex-col gap-2 z-10">
      <div class="h-10 rounded-xl border-1 border-blue-500/80 bg-surface-200 flex items-center justify-center transition-all duration-200 hover:border-blue-400
    	tracking-wider text-blue-400/70 select-all font-mono">
        https://chess-obs.mostik.dev/widget
      </div>

      <div class="w-[490px] h-[320px] aspect-video rounded-2xl border-1 border-blue-500/80 bg-surface-200 flex items-center justify-center relative overflow-hidden">
        <iframe src={src} class="w-full h-full" />
      </div>
    </div>
  );
}
