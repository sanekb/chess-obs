export function Header({ playerName }) {
  return (
    <header class="text-center space-y-3 z-10">
      <div class="text-2xl lg:text-3xl font-bold tracking-wide text-primary">
        chess-obs
      </div>
      <div class="text-xs lg:text-sm text-secondary-100 leading-relaxed">
        <p>
          • задаётся "последняя партия" из архива партий{" "}
          <a
            class="text-secondary-100 hover:text-primary underline transition-all duration-150"
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
