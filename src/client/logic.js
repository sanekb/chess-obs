import { $fetch } from "@/client/api.js";

export const changeTournDate = (dir) =>
  $fetch("/change/:dir", { params: { dir: String(dir) } });
export const manualRefresh = () => $fetch("/refresh");
export const toggleWatchMode = () => $fetch("/watch");
export const toggleBonus = () => $fetch("/bonus");
export const togglePrize = () => $fetch("/prize");
