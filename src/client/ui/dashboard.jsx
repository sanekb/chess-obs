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
import {
  APP_NAME,
  M,
  S,
  TOOLTIP_DELAY,
  WATCH_MODE_INTERVAL,
} from "@/consts.js";
import {
  changeBonusAmount,
  changeTournDate,
  manualRefresh,
  toggleBonus,
  togglePrize,
  toggleWatchMode,
} from "@/client/actions.js";
import { cn, getLastTournDate, localDate } from "@/client/utils.js";
import { debounce } from "@std/async";

export default function Dashboard() {
  const {
    playerName,
    tournDateStr,
    isWatchModeEnabled,
    watchModeAutoOff,
    isPrizeEnabled,
    isBonusEnabled,
    bonusAmount,
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
          "w-full min-h-dvh px-2 md:px-4 py-6",
          "flex flex-col items-center justify-start gap-8 lg:gap-12",
          "bg-surface-100 text-secondary-200 text-sm font-montserrat",
        )}
      >
        <Header appName={APP_NAME} playerName={playerName} />
        <Controls>
          <Control>
            <div class="flex items-center gap-1">
              <Button
                onclick={() => changeTournDate("last")}
                active={tournDateStr.value ===
                  localDate(getLastTournDate())}
                disabled={tournDateStr.value ===
                  localDate(getLastTournDate())}
              >
                Последний
              </Button>
              <Button
                onclick={() => changeTournDate("next")}
                disabled={tournDateStr.value ===
                  localDate(getLastTournDate())}
              >
                ⬆
              </Button>
              <Button onclick={() => changeTournDate("prev")}>⬇</Button>
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
                  ? new Date(
                    watchModeAutoOff.value * WATCH_MODE_INTERVAL / M * S,
                  )
                    .toTimeString()
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
            <div class="flex items-center gap-1">
              <Button
                onclick={() => changeBonusAmount("minus")}
                disabled={!isBonusEnabled.value || bonusAmount.value === 0}
              >
                −
              </Button>
              <Button
                onclick={() => toggleBonus()}
                active={isBonusEnabled.value}
              >
                Бонус
              </Button>
              <Button
                onclick={() => changeBonusAmount("plus")}
                disabled={!isBonusEnabled.value}
              >
                +
              </Button>
            </div>
            <Span>
              {isBonusEnabled.value ? `+${bonusAmount.value}₽` : "за топы"}
            </Span>
          </Control>
        </Controls>
        <Footer />
      </div>
    </>
  );
}
