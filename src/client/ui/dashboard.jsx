import { Background } from "@/client/lib/background.jsx";
import { Header } from "@/client/lib/header.jsx";
import { Button, Control, Controls, Span } from "@/client/lib/controls.jsx";
import { Preview } from "@/client/lib/preview.jsx";
import { Footer } from "@/client/lib/footer.jsx";
import { useEffect } from "preact/hooks";
import { effect, signal } from "@preact/signals";
import { store } from "@/client/app-store.js";
import { api, asJson } from "@/client/app-api.js";
import { PRIZE_FOR_TOP, TOOLTIP_DELAY } from "@/consts.js";

const nbsp = { text: "\u00A0" };
const refreshStatus = signal(nbsp);
const manualRefresh = () => {
  api.refresh.$post();
  refreshStatus.value = { text: "обновлено!" };
};
effect(() => {
  if (refreshStatus.value !== nbsp) {
    const timer = setTimeout(() => refreshStatus.value = nbsp, TOOLTIP_DELAY);
    return () => clearTimeout(timer);
  }
});

const changeOffset = (off) =>
  api.offset[":off"].$post({ param: { off: String(off) } });
const toggleWatchMode = () => api.watch.$post();
const toggleBonus = () => api.bonus.$post();
const togglePrize = () => api.prize.$post();

export default function Dashboard({ state }) {
  useEffect(() => store.parse(state), []);

  const {
    playerName,
    lastGameId,
    isWatchModeEnabled,
    isBonusEnabled,
    isPrizeEnabled,
  } = store;

  return (
    <div class="relative min-h-screen bg-dark text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">
      <Background />

      <div class="w-full max-w-2xl flex-1 flex flex-col items-center justify-start gap-12">
        <Header playerName={playerName} />
        <Controls>
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
            <Span>{refreshStatus.value.text}</Span>
          </Control>
          <Control>
            <Button onclick={toggleWatchMode} active={isWatchModeEnabled.value}>
              Авто
            </Button>
            <Span>{isWatchModeEnabled.value ? "работает" : "выключено"}</Span>
          </Control>
        </Controls>
        <Preview src="/widget" />
        <Controls>
          <Control>
            <Button onclick={toggleBonus} active={isBonusEnabled.value}>
              Бонус
            </Button>
            <Span>
              {isBonusEnabled.value ? `+${PRIZE_FOR_TOP / 1e3}к` : nbsp.text}
            </Span>
          </Control>
          <Control>
            <Button onclick={togglePrize} active={isPrizeEnabled.value}>
              Призовые
            </Button>
            <Span>{isPrizeEnabled.value ? "видны" : "скрыты"}</Span>
          </Control>
        </Controls>
        <Footer />
      </div>
    </div>
  );
}
