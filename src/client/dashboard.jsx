import { useSignal } from "@preact/signals";
import { hc } from "@hono/hono/client";

import { Background } from "@/client/background.jsx";
import { Header } from "@/client/header.jsx";
import { Button, Control, Controls, Span } from "@/client/controls.jsx";
import { Preview } from "@/client/preview.jsx";
import { Footer } from "@/client/footer.jsx";

import { autoOff, debounce } from "@/consts.js";

export default function Dashboard({ state }) {
  const member = state.member;

  const isWatching = useSignal(state.watch);
  const lastGameId = useSignal(state.lastGameId);

  const isRefreshing = useSignal(false);
  const refreshingTimeoutId = useSignal(0);

  const client = hc("/dashboard");

  async function changeOffset(off) {
    const store = await client.offset[":off"].$post({
      param: { off: String(off) },
    }).then((r) => r.json());

    lastGameId.value = store.lastGameId;
  }

  async function manualRefresh() {
    const store = await client.refresh.$post().then((r) => r.json());

    clearTimeout(refreshingTimeoutId.value);

    isRefreshing.value = true;
    refreshingTimeoutId.value = setTimeout(
      () => isRefreshing.value = false,
      debounce,
    );
  }

  async function toogleWatchMode() {
    const store = await client.watch.$post().then((r) => r.json());

    isWatching.value = store.watch;

    if (isWatching.value) setTimeout(() => isWatching.value = false, autoOff);
  }

  return (
    <div class="relative min-h-screen bg-dark text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">
      <Background />

      <div class="w-full max-w-2xl flex-1 flex flex-col items-center justify-start gap-10">
        <Header member={member} />
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
            <Span>{isRefreshing.value ? "обновлено!" : "\u00A0"}</Span>
          </Control>
          <Control>
            <Button onclick={toogleWatchMode} active={isWatching.value}>
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
