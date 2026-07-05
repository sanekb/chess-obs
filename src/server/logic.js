import { store } from "@/server/store.js";
import {
  APP_NAME,
  GM_SCORE,
  RESULTS,
  WATCH_MODE_AUTO_OFF,
  WATCH_MODE_INTERVAL,
} from "@/consts.js";
import {
  env,
  getLastTournDate,
  getTournUrlRegExp,
  isGreaterThan,
  isTuesday,
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
  const ltd = getLastTournDate();
  let td;

  if (dir === 1) {
    td = tournDate.add({ days: isTuesday(tournDate) ? 2 : 5 });
  }
  if (dir === -1) {
    td = tournDate.subtract({ days: isTuesday(tournDate) ? 5 : 2 });
  }
  if (dir === 0 || isGreaterThan(td, ltd)) {
    td = ltd;
  }

  tournDateStr.value = td.toLocaleString();
  store.tournDate = td;

  logger.info("tournDate changed: {date}", { date: tournDateStr.value });
}

export function updateTourResults(games) {
  const { tournDate, tourResults } = store;

  const regexp = getTournUrlRegExp(tournDate);

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
    watchModeAbortSignal,
  } = store;

  poll(
    async () => {
      const games = await getGames();
      updateTourResults(games);
      watchModeAutoOff.value--;
      isWatchModeEnabled.value = watchModeAutoOff.value > 0;
    },
    () => (!isWatchModeEnabled.value || watchModeAutoOff.value <= 0),
    {
      interval: WATCH_MODE_INTERVAL,
      signal: watchModeAbortSignal,
    },
  );
}

export function toggleWatchMode(getGames) {
  const { isWatchModeEnabled, watchModeAutoOff } = store;
  isWatchModeEnabled.value = !isWatchModeEnabled.value;

  if (isWatchModeEnabled.value) {
    watchModeAutoOff.value = WATCH_MODE_AUTO_OFF;
    store.watchModeAbortSignal = new AbortSignal();
    watchLoop(getGames);
  } else {
    watchModeAutoOff.value = 0;
    store.watchModeAbortSignal.abort();
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
