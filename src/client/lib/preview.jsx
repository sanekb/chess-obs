export function Preview({ src }) {
  return (
    <div class="w-full max-w-[490px] flex flex-col gap-2 z-10">
      <div class="h-10 rounded-lg border-1 border-grey-200 hover:border-grey-100 bg-surface-200 flex items-center justify-center transition-all duration-150
    	tracking-wider text-grey-100 hover:text-milk select-all font-mono">
        https://chess-obs.mostik.dev/widget
      </div>

      <div class="resize aspect-[3/2] rounded-lg border-1 border-grey-200 bg-surface-200 flex items-center justify-center relative ">
        <iframe src={src} class="w-full h-full" />
      </div>
    </div>
  );
}
