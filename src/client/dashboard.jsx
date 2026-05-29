import { Background } from "@/client/background.jsx";
import { Header } from "@/client/header.jsx";
import { Button, Control, Controls, Span } from "@/client/controls.jsx";
import { Preview } from "@/client/preview.jsx";
import { Footer } from "@/client/footer.jsx";
import { useDashboard } from "@/client/useDashboard.js";

export default function Dashboard({ state }) {
  const {
    member,

    lastGameId,
    isApplyBonus,
    isRefreshing,
    isWatching,

    toggleBonus,
    changeOffset,
    manualRefresh,
    toggleWatchMode,
  } = useDashboard(state);

  return (
    <div class="relative min-h-screen bg-dark text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">
      <Background />

      <div class="w-full max-w-2xl flex-1 flex flex-col items-center justify-start gap-12">
        <Header member={member} />
        <Controls>
          <Control>
            <Button onclick={toggleBonus} active={isApplyBonus.value}>
              Бонус
            </Button>
            <Span>{isApplyBonus.value ? "+10к" : "\u00A0"}</Span>
          </Control>
          <Control>
            <div class="flex items-center gap-1">
              <Button onclick={() => changeOffset(-1)}>&lt;</Button>
              <Button onclick={() => changeOffset(0)}>0</Button>
              <Button onclick={() => changeOffset(1)}>&gt;</Button>
            </div>
            <Span>{lastGameId.value}</Span>
          </Control>
          <Control>
            <Button onclick={manualRefresh}>Обновить</Button>
            <Span>{isRefreshing.value ? "обновлено!" : "\u00A0"}</Span>
          </Control>
          <Control>
            <Button onclick={toggleWatchMode} active={isWatching.value}>
              Авто
            </Button>
            <Span>{isWatching.value ? "работает" : "выключено"}</Span>
          </Control>
        </Controls>
        <Preview src="/widget" />
        <Footer />
      </div>
    </div>
  );
}
