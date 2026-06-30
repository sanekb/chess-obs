export function Header({ playerName }) {
  return (
    <header class="space-y-3 z-10">
      <h1 class="text-center text-2xl lg:text-3xl font-bold tracking-wide text-primary">
        chess-obs
      </h1>
      <ul class="list-disc text-xs lg:text-sm text-secondary-100 leading-relaxed sm:px-5 lg:px-4 xl:px-6">
        <li>
          задаётся <strong>последняя до-турнирная партия</strong>{" "}
          <span class="whitespace-nowrap">
            из архива партий{" "}
            <a
              class="text-secondary-100 hover:text-primary underline transition-all duration-150"
              href={`https://www.chess.com/member/${playerName.value.toLowerCase()}/games`}
            >
              {playerName.value}
            </a>
          </span>
        </li>
        <li>
          результаты всех новых партий после <strong>неё</strong>{" "}
          <span class="whitespace-nowrap">отображаются в Виджете</span>
        </li>
        <li>
          загрузка результатов новых партий происходит{" "}
          <span class="whitespace-nowrap">
            либо вручную, либо автоматически
          </span>
        </li>
      </ul>
    </header>
  );
}
