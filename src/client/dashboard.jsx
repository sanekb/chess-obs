import { useSignal } from "@preact/signals";
import { hc } from "@hono/hono/client";

import { Background } from "@/client/background.jsx";
import { Header } from "@/client/header.jsx";
import { Button, Control, Controls, Span } from "@/client/controls.jsx";
import { Preview } from "@/client/preview.jsx";
import { Footer } from "@/client/footer.jsx";

import { autoOff, debounce } from "@/consts.js";

export default function Dashboard({ state }) {
  const watch = useSignal(state.watch ?? false);
  const lastGameId = useSignal(state.lastGameId ?? 0);
  const member = state.member;
  const refresh = useSignal(false);
  const refreshTimer = useSignal(0);

  const client = hc("/dashboard");

  async function _offset(off) {
    const res = await client.offset[":off"].$post({
      param: { off: String(off) },
    });
    const json = await res.json();

    lastGameId.value = json.lastGameId;
  }

  async function _watch() {
    const res = await client.watch.$post();
    const json = await res.json();

    watch.value = json.watch;

    if (watch.value) setTimeout(() => watch.value = false, autoOff);
  }

  async function _refresh() {
    const res = await client.refresh.$post();
    const json = await res.json();

    clearTimeout(refreshTimer.value);

    refresh.value = json.refresh;
    refreshTimer.value = setTimeout(() => refresh.value = false, debounce);
  }

  return (
    <div class="relative min-h-screen bg-dark text-gray-200 flex flex-col items-center justify-start p-6 overflow-x-hidden font-sans">
      <Background />

      <div class="w-full max-w-2xl flex-1 flex flex-col items-center justify-start gap-10">
        <Header member={member} />
        <Controls>
          <Control>
            <div class="flex items-center gap-1">
              <Button onclick={() => _offset(-1)}>&lt;</Button>
              <Button onclick={() => _offset(0)}>0</Button>
              <Button onclick={() => _offset(1)}>&gt;</Button>
            </div>
            <Span>{lastGameId.value}</Span>
          </Control>
          <Control>
            <Button onclick={_refresh}>Обновить</Button>
            <Span>{refresh.value ? "обновлено!" : "\u00A0"}</Span>
          </Control>
          <Control>
            <Button onclick={_watch} active={watch.value}>Авто</Button>
            <Span>{watch.value ? "работает" : "выключено"}</Span>
          </Control>
        </Controls>
        <Preview src="/widget" />
        <Footer />
      </div>
    </div>
  );
}
