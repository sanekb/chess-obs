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
  isThursday,
} from "@/server/utils.js";
import { poll } from "@std/async";
import { batch } from "preact-signals-core";
import { getLogger } from "logtape";

const logger = getLogger([APP_NAME, "logic"]);

export async function setupAtStartup(getGames) {
  changeTournDate(0);

  const games = await getGames();
  updateTourResults(games);
}

export async function setupTournament(isThursday, getGames) {
  const {
    isWatchModeEnabled,
    isPrizeEnabled,
    isBonusEnabled,
  } = store;

  changeTournDate(0);

  const games = await getGames();
  updateTourResults(games);

  toggleWatchMode(getGames);
  if (!isWatchModeEnabled.value) {
    toggleWatchMode(getGames);
  }

  isPrizeEnabled.value = isThursday;
  isBonusEnabled.value = false;

  logger.info("tournament setuped");
}

export function changeTournDate(dir) {
  const { tournDate, tournDateStr } = store;

  let ntd, ltd = getLastTournDate();

  const method = dir > 0 ? "add" : "subtract";
  const offset = isThursday(tournDate.value)
    ? { 1: 5, 0: 0, [-1]: 2 }
    : { 1: 2, 0: 0, [-1]: 5 };
  const days = offset[dir];

  ntd = tournDate.value[method]({ days });

  if (dir === 0 || isGreaterThan(ntd, ltd)) {
    ntd = ltd;
  }

  tournDate.value = ntd;
  tournDateStr.value = ntd.toLocaleString();

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

  logger.info("tourResults changed: {results}", { results: tourResults.value });
}

function watchLoop(getGames) {
  const {
    isWatchModeEnabled,
    watchModeAutoOff,
    watchModeAbortController,
  } = store;

  poll(
    async () => {
      // const games = await getGames();
      // updateTourResults(games);
      console.log("getGames");
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
    isWatchModeEnabled.value = false;
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
