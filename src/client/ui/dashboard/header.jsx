export function Header({ appName, playerName }) {
  return (
    <header class="space-y-6 z-10">
      <h1 class="flex justify-center items-baseline gap-1">
        <img src="/favicon.svg" class="size-6 self-center" />
        <span class="text-2xl lg:text-3xl font-bold tracking-wide text-primary">
          {appName}
        </span>
        <span class="text-sm text-secondary-200 px-1">v1.4</span>
      </h1>
      <ul class="list-disc text-xs lg:text-sm text-secondary-100 leading-relaxed sm:px-5 lg:px-4 xl:px-6">
        <li>
          программа получает и отображает результаты{" "}
          <span class="whitespace-nowrap">
            Титульника заданной даты для{"  "}
            <a
              class="text-secondary-100 hover:text-primary underline transition-all duration-150"
              href={`https://www.chess.com/member/${playerName.value.toLowerCase()}`}
            >
              {playerName.value}
            </a>
          </span>
        </li>
        <li>
          с началом Титульника программа <strong>автоматически</strong>{" "}
          применяет <span class="whitespace-nowrap">нужные настройки</span>
        </li>
        <li>
          все доступные настройки можно изменить{" "}
          <strong>в ручном режиме</strong>{" "}
          <span class="whitespace-nowrap">
            соответствующими кнопками
          </span>
        </li>
      </ul>
    </header>
  );
}
