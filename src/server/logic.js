import { store } from "@/server/store.js";
import {
  APP_NAME,
  GM_SCORE,
  RESULTS,
  WATCH_MODE_AUTO_OFF,
  WATCH_MODE_INTERVAL,
} from "@/consts.js";
import {
  emptyFn,
  env,
  getLastTournDate,
  getTournUrlRegExp,
  isGreaterThan,
  isTournDay,
  isTournTime,
  isTuesday,
} from "@/server/utils.js";
import { poll } from "@std/async";
import { getLogger } from "logtape";

const logger = getLogger([APP_NAME, "logic"]);

export async function setupStore(today, getGames) {
  const {
    tournDate,
    isWatchModeEnabled,
    isPrizeEnabled,
    isBonusEnabled,
  } = store;

  changeTournDate(0);

  const games = await getGames(tournDate.value);
  updateTourResults(games);

  if (isWatchModeEnabled.value) {
    toggleWatchMode(getGames);
  }

  if (!isWatchModeEnabled.value && isTournDay(today) && isTournTime()) {
    toggleWatchMode(getGames);
  }

  isPrizeEnabled.value = !isTuesday(today);
  isBonusEnabled.value = false;
}

export function changeTournDate(dir) {
  const { tournDate, tournDateStr } = store;

  const method = dir > 0 ? "add" : "subtract";
  const amount = isTuesday(tournDate.value)
    ? { 1: 2, 0: 0, [-1]: 5 }
    : { 1: 5, 0: 0, [-1]: 2 };

  const newTD = tournDate.value[method]({ days: amount[dir] });
  const lastTD = getLastTournDate();
  const finTD = (dir === 0 || isGreaterThan(newTD, lastTD)) ? lastTD : newTD;

  tournDate.value = finTD;
  tournDateStr.value = finTD.toLocaleString("ru");

  logger.info`changeTournDate(${dir}) -> ${tournDateStr.value}`;
}

export function updateTourResults(games) {
  const { tournDate, tourResults } = store;

  const regexp = getTournUrlRegExp(tournDate.value);

  const results = games.filter((g) => regexp.test(g.tournament ?? ""))
    .sort((a, b) => a.end_time - b.end_time).map((g) =>
      g.white.username === env.playerName
        ? [RESULTS[g.white.result], g.black.rating >= GM_SCORE]
        : [RESULTS[g.black.result], g.white.rating >= GM_SCORE]
    );

  tourResults.value = results;

  logger.info("updateTourResults -> {results}", {
    results: tourResults.value.map((r) => `${r[0]}${r[1] ? "*" : ""}`).join(
      " ",
    ),
  });
}

function watchLoop(getGames) {
  const {
    tournDate,
    isWatchModeEnabled,
    watchModeAutoOff,
    watchModeAbortController,
  } = store;

  poll(
    async () => {
      logger.debug`watchLoop: ${watchModeAutoOff.value}`;
      const games = await getGames(tournDate.value);
      updateTourResults(games);
    },
    () => --watchModeAutoOff.value <= 0,
    {
      interval: WATCH_MODE_INTERVAL,
      signal: watchModeAbortController.value.signal,
    },
  )
    .then(() => isWatchModeEnabled.value = false)
    .catch(emptyFn);
}

export function toggleWatchMode(getGames) {
  const {
    isWatchModeEnabled,
    watchModeAutoOff,
    watchModeAbortController,
  } = store;

  isWatchModeEnabled.value = !isWatchModeEnabled.value;

  if (isWatchModeEnabled.value) {
    watchModeAutoOff.value = WATCH_MODE_AUTO_OFF;
    watchModeAbortController.value = new AbortController();
    watchLoop(getGames);
  } else {
    watchModeAutoOff.value = 0;
    watchModeAbortController.value.abort();
  }

  logger.info`toggleWatchMode: ${!isWatchModeEnabled
    .value} -> ${isWatchModeEnabled.value}`;
}

export function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
  logger.info`toggleBonus: ${!isBonusEnabled.value} -> ${isBonusEnabled.value}`;
}

export function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
  logger.info`togglePrize: ${!isPrizeEnabled.value} -> ${isPrizeEnabled.value}`;
}
