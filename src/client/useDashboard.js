import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { asJson, client } from "@/client/hc.js";
import { autoOff, debounce } from "@/consts.js";

export function useDashboard(state) {
  const lastGameId = useSignal(state.lastGameId);
  const isApplyBonus = useSignal(state.bonus);
  const isRefreshing = useSignal(false);
  const isWatching = useSignal(state.watch);

  let refreshingTimeoutId = 0;
  let watchingTimeoutId = 0;
  let zapusk = 0;
  const watchTimeout = (baseTime) => {
    const TZ = ++zapusk;
    clearTimeout(watchingTimeoutId);
    console.log(`Очистили какой-то таймер (${watchingTimeoutId})`);
    // console.log(`delta: ${Date.now() - baseTime}`);
    // console.log(`TIME: ${autoOff - (Date.now() - baseTime)}`);
    watchingTimeoutId = setTimeout(
      () => {
        isWatching.value = false;
        console.log(`А это таймер ${TZ}`);
      },
      autoOff - (Date.now() - baseTime),
    );
    console.log(`запустился таймер ${TZ} (${watchingTimeoutId})`);
  };

  // useEffect(() => {
  //   watchTimeout(state.autoOffStart);
  //   return () => {
  //     clearTimeout(watchingTimeoutId);
  //     clearTimeout(refreshingTimeoutId);
  //   };
  // }, []);

  async function toggleBonus() {
    const store = await asJson(client.bonus.$post());
    isApplyBonus.value = store.bonus;
  }

  async function changeOffset(off) {
    const store = await asJson(client.offset[":off"].$post({
      param: { off: String(off) },
    }));
    lastGameId.value = store.lastGameId;
  }

  async function manualRefresh() {
    await asJson(client.refresh.$post());
    clearTimeout(refreshingTimeoutId);
    isRefreshing.value = true;
    refreshingTimeoutId = setTimeout(
      () => isRefreshing.value = false,
      debounce,
    );
  }

  async function toggleWatchMode() {
    const store = await asJson(client.watch.$post());
    isWatching.value = store.watch;
    if (isWatching.value) {
      watchTimeout(store.autoOffStart);
    } else {
      clearTimeout(watchingTimeoutId);
    }
  }

  return {
    member: state.member,

    lastGameId,
    isApplyBonus,
    isRefreshing,
    isWatching,

    toggleBonus,
    changeOffset,
    manualRefresh,
    toggleWatchMode,
  };
}
