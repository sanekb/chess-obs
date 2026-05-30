export function Header({ playerName }) {
  return (
    <header class="text-center space-y-3 z-10">
      <h1 class="text-3xl font-bold tracking-wide text-white select-none">
        chess-obs
      </h1>
      <div class="text-grey-2 text-sm leading-relaxed">
        <p>
          задаётся "последняя партия" из архива партий{" "}
          <a
            class="text-blue-400 font-mono"
            href={`https://www.chess.com/member/${playerName.value.toLowerCase()}/games`}
          >
            {playerName.value}
          </a>
        </p>
        <p>результаты всех новых партий показываются в Виджете</p>
        <p>
          обновление либо вручную по кнопке, либо автоматически раз в минуту
        </p>
      </div>
    </header>
  );
}
