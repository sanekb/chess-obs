import { api } from "@/client/api.js";

export const changeOffset = (off) =>
  api.offset[":off"].$post({ param: { off: String(off) } });

export const manualRefresh = (signal) => {
  api.refresh.$post().then((r) => {
    if (r.status === 204) signal.value = { text: "обновлено!" };
  });
};

export const toggleWatchMode = () => api.watch.$post();

export const toggleBonus = () => api.bonus.$post();
export const togglePrize = () => api.prize.$post();
