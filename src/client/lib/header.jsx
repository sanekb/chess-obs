export function Header({ playerName }) {
  return (
    <header class="text-center space-y-3 z-10">
      <div class="text-3xl font-bold tracking-wide text-milk">
        chess-obs
      </div>
      <div class="text-grey-100 leading-relaxed">
        <p>
          • задаётся "последняя партия" из архива партий{" "}
          <a
            class="text-grey-100 hover:text-milk underline font-mono"
            href={`https://www.chess.com/member/${playerName.value.toLowerCase()}/games`}
          >
            {playerName.value}
          </a>
        </p>
        <p>• результаты всех новых партий показываются в Виджете</p>
        <p>
          • обновление либо вручную по кнопке, либо автоматически раз в минуту
        </p>
      </div>
    </header>
  );
}
