import { $fetch } from "@/client/api.js";

export const changeTournDate = (dir) =>
  $fetch("/tourndate/:dir", { params: { dir } });
export const manualRefresh = () => $fetch("/refresh");
export const toggleWatchMode = () => $fetch("/watch");
export const togglePrize = () => $fetch("/prize");
export const toggleBonus = () => $fetch("/bonus");
export const changeBonusAmount = (dir) =>
  $fetch("/bonus/:dir", { params: { dir } });
