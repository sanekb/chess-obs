export function Header({ playerName }) {
  return (
    <header class="text-center space-y-3 z-10">
      <h1 class="text-3xl font-bold tracking-wide text-white select-none">
        chess-obs
      </h1>
      <div class="text-grey-2 text-sm max-w-sm mx-auto leading-relaxed">
        <p>тут будет текст</p>
        <p>короткая инструкция</p>
        <p>описание че это такое</p>
        <p class="text-blue-400 font-mono">{playerName}</p>
      </div>
    </header>
  );
}
