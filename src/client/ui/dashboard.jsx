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
import { useSignal } from "preact-signals";
import { useCallback } from "preact/hooks";
import { store } from "@/client/store.js";
import { APP_NAME, PRIZE_FOR_TOP, TOOLTIP_DELAY } from "@/consts.js";
import {
  changeTournDate,
  manualRefresh,
  toggleBonus,
  togglePrize,
  toggleWatchMode,
} from "@/client/actions.js";
import { cn, getLastTournDate } from "@/client/utils.js";
import { debounce } from "@std/async";

export default function Dashboard() {
  const {
    playerName,
    tournDateStr,
    isWatchModeEnabled,
    watchModeAutoOff,
    isBonusEnabled,
    isPrizeEnabled,
  } = store;

  const refreshStatus = useSignal(false);
  const refreshTrue = () => refreshStatus.value = true;
  const refreshFalse = useCallback(
    debounce(() => refreshStatus.value = false, TOOLTIP_DELAY),
    [],
  );

  return (
    <>
      <Background />
      <div
        class={cn(
          "w-screen min-h-dvh px-2 md:px-4 py-6",
          "flex flex-col items-center justify-start gap-8 lg:gap-12",
          "bg-surface-100 text-secondary-200 text-sm font-montserrat",
        )}
      >
        <Header appName={APP_NAME} playerName={playerName} />
        <Controls>
          <Control>
            <div class="flex items-center gap-1">
              <Button onclick={() => changeTournDate(0)}>Последний</Button>
              <Button
                onclick={() => changeTournDate(1)}
                disabled={tournDateStr.value ===
                  getLastTournDate().toLocaleString()}
              >
                ⬆
              </Button>
              <Button onclick={() => changeTournDate(-1)}>⬇</Button>
            </div>
            <Span>Турнир от {tournDateStr.value}</Span>
          </Control>
          <div class="flex items-center justify-center gap-4 xl:gap-6">
            <Control>
              <Button
                onclick={() =>
                  manualRefresh().then((
                    res,
                  ) => (!res.error && refreshTrue() && refreshFalse()))}
              >
                Обновить
              </Button>
              <Span>{refreshStatus.value ? "обновлено!" : "вручную"}</Span>
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
              {isBonusEnabled.value ? `+${PRIZE_FOR_TOP}₽` : "нет"}
            </Span>
          </Control>
        </Controls>
        <Footer />
      </div>
    </>
  );
}
