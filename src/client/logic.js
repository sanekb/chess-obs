import { api } from "@/client/api.js";

export const changeOffset = (off) =>
  api("/offset/:off", { params: { off: String(off) } });
export const manualRefresh = () => api("/refresh");
export const toggleWatchMode = () => api("/watch");
export const toggleBonus = () => api("/bonus");
export const togglePrize = () => api("/prize");
