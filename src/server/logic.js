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
  getTournUrlRegExp,
  isGreaterThan,
  isTournDay,
  isTuesday,
  today,
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

  if (!isWatchModeEnabled.value && isTournDay(today)) {
    toggleWatchMode(getGames);
  }

  isPrizeEnabled.value = !isTuesday(today);
  isBonusEnabled.value = false;

  logger.info("tournament setuped");
}

export function changeTournDate(dir) {
  const { tournDate, tournDateStr } = store;

  const date = today();
  const toSubt = [0, 4, 0, 1, 0, 1, 2, 3];
  const lastTD = date.subtract({ days: toSubt[date.dayOfWeek] });

  const method = dir > 0 ? "add" : "subtract";
  const amount = isTuesday(tournDate.value)
    ? { 1: 2, 0: 0, [-1]: 5 }
    : { 1: 5, 0: 0, [-1]: 2 };

  const newTD = tournDate.value[method]({ days: amount[dir] });
  const TD = (dir === 0 || isGreaterThan(newTD, lastTD)) ? lastTD : newTD;

  tournDate.value = TD;
  tournDateStr.value = TD.toLocaleString();

  logger.info("tournDate changed: {date}", { date: tournDateStr.value });
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

  logger.info("tourResults changed: {results}", {
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
      const games = await getGames(tournDate.value);
      updateTourResults(games);
      // console.log("getGames");
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
}

export function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
}

export function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
}
