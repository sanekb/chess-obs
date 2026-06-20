import { Background } from "@/client/ui/dashboard/background.jsx";
import { Header } from "@/client/ui/dashboard/header.jsx";
import {
  Button,
  Control,
  Controls,
  Span,
} from "@/client/ui/dashboard/controls.jsx";
import { Preview } from "@/client/ui/dashboard/preview.jsx";
import { Footer } from "@/client/ui/dashboard/footer.jsx";
import { useSignal, useSignalEffect } from "preact-signals";
import { store } from "@/client/store.js";
import { PRIZE_FOR_TOP, TOOLTIP_DELAY } from "@/consts.js";
import { clsx } from "clsx";
import {
  changeOffset,
  manualRefresh,
  toggleBonus,
  togglePrize,
  toggleWatchMode,
} from "@/client/logic.js";

const nbsp = { text: "\u00A0" };

export default function Dashboard() {
  const {
    playerName,
    lastGameId,
    isWatchModeEnabled,
    watchModeAutoOff,
    isBonusEnabled,
    isPrizeEnabled,
    gameResults,
  } = store;

  const refreshStatus = useSignal(nbsp);
  useSignalEffect(() => {
    if (refreshStatus.value !== nbsp) {
      const timer = setTimeout(() => refreshStatus.value = nbsp, TOOLTIP_DELAY);
      return () => clearTimeout(timer);
    }
  });

  return (
    <>
      <Background />
      <div
        class={clsx(
          "w-screen min-h-screen px-2 md:px-6 py-6",
          "flex flex-col items-center justify-start gap-8 lg:gap-12",
          "bg-surface-100 text-secondary-200 text-sm font-montserrat",
        )}
      >
        <Header playerName={playerName} />
        <Controls>
          <Control>
            <div class="flex items-center gap-1">
              <Button onclick={() => changeOffset(0)}>Последняя</Button>
              <Button
                onclick={() => changeOffset(-1)}
                disabled={gameResults.value.length === 0}
              >
                ⬆
              </Button>
              <Button onclick={() => changeOffset(1)}>⬇</Button>
            </div>
            <Span>{lastGameId.value}</Span>
          </Control>
          <div class="flex items-center justify-center gap-6">
            <Control>
              <Button onclick={() => manualRefresh(refreshStatus)}>
                Обновить
              </Button>
              <Span>{refreshStatus.value.text}</Span>
            </Control>
            <Control>
              <Button
                onclick={toggleWatchMode}
                active={isWatchModeEnabled.value}
              >
                Авто
              </Button>
              <Span>
                {isWatchModeEnabled.value
                  ? new Date(watchModeAutoOff.value * 1e3).toTimeString()
                    .substring(3, 8)
                  : "выключено"}
              </Span>
            </Control>
          </div>
        </Controls>
        <Preview src="/widget" />
        <Controls>
          <Control>
            <Button onclick={togglePrize} active={isPrizeEnabled.value}>
              Призовые
            </Button>
            <Span>{isPrizeEnabled.value ? "видны" : "скрыты"}</Span>
          </Control>
          <Control>
            <Button onclick={toggleBonus} active={isBonusEnabled.value}>
              Бонус за топ-30
            </Button>
            <Span>
              {isBonusEnabled.value ? `+${PRIZE_FOR_TOP / 1e3}к` : "нет"}
            </Span>
          </Control>
        </Controls>
        <Footer />
      </div>
    </>
  );
}
