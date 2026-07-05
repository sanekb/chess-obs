import { api } from "@/client/api.js";

export const changeTournDate = (dir) =>
  api("/change/:dir", { params: { dir: String(dir) } });
export const manualRefresh = () => api("/refresh");
export const toggleWatchMode = () => api("/watch");
export const toggleBonus = () => api("/bonus");
export const togglePrize = () => api("/prize");
