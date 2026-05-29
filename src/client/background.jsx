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
