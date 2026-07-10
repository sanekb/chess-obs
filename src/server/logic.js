import {
  APP_NAME,
  BONUS_FOR_TOP30,
  BONUS_STEP,
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
  isTournMoment,
  isTuesday,
  localDate,
} from "@/server/utils.js";
import { poll } from "@std/async";
import { getLogger } from "logtape";

const logger = getLogger([APP_NAME, "logic"]);

export function createLogic({ store, chessApi }) {
  async function prepareStore() {
    const {
      tournDate,
      isWatchModeEnabled,
      isPrizeEnabled,
      isBonusEnabled,
      bonusAmount,
    } = store;

    if (!isTournMoment()) return;

    changeTournDate(0);

    const games = await chessApi.getGames(tournDate.value);
    updateTourResults(games);

    do {
      toggleWatchMode();
    } while (!isWatchModeEnabled.value);

    isPrizeEnabled.value = !isTuesday(tournDate.value);
    isBonusEnabled.value = false;
    bonusAmount.value = BONUS_FOR_TOP30;

    logger.info("Store prepared for Tourn by cron");
  }

  function changeTournDate(dir) {
    const { tournDate, tournDateStr } = store;

    const method = dir === "next" ? "add" : "subtract";
    const amount = isTuesday(tournDate.value)
      ? { prev: 5, last: 0, next: 2 }
      : { prev: 2, last: 0, next: 5 };

    const newTD = tournDate.value[method]({ days: amount[dir] });
    const lastTD = getLastTournDate();
    const finTD = (dir === "last" || isGreaterThan(newTD, lastTD))
      ? lastTD
      : newTD;

    tournDate.value = finTD;
    tournDateStr.value = localDate(finTD);

    logger.info`changeTournDate(${dir}) -> ${tournDateStr.value}`;
  }

  function updateTourResults(games) {
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

  function watchLoop() {
    const {
      tournDate,
      tourResults,
      isWatchModeEnabled,
      watchModeAutoOff,
      watchModeAbortController,
    } = store;

    poll(
      async () => {
        logger.debug`watchLoop: ${watchModeAutoOff.value}`;
        const games = await chessApi.getGames(tournDate.value);
        updateTourResults(games);
      },
      () =>
        (--watchModeAutoOff.value <= 0) || (tourResults.value.length === 11),
      {
        interval: WATCH_MODE_INTERVAL,
        signal: watchModeAbortController.value.signal,
      },
    )
      .then(() => isWatchModeEnabled.value = false)
      .catch(emptyFn);
  }

  function toggleWatchMode() {
    const {
      isWatchModeEnabled,
      watchModeAutoOff,
      watchModeAbortController,
    } = store;

    isWatchModeEnabled.value = !isWatchModeEnabled.value;

    if (isWatchModeEnabled.value) {
      watchModeAutoOff.value = WATCH_MODE_AUTO_OFF;
      watchModeAbortController.value = new AbortController();
      watchLoop();
    } else {
      watchModeAutoOff.value = 0;
      watchModeAbortController.value.abort();
    }

    logger.info`toggleWatchMode: ${!isWatchModeEnabled
      .value} -> ${isWatchModeEnabled.value}`;
  }

  function togglePrize() {
    const { isPrizeEnabled } = store;
    isPrizeEnabled.value = !isPrizeEnabled.value;
    logger.info`togglePrize: ${!isPrizeEnabled
      .value} -> ${isPrizeEnabled.value}`;
  }

  function toggleBonus() {
    const { isBonusEnabled, bonusAmount } = store;
    isBonusEnabled.value = !isBonusEnabled.value;

    if (isBonusEnabled.value) bonusAmount.value = BONUS_FOR_TOP30;

    logger.info`toggleBonus: ${!isBonusEnabled
      .value} -> ${isBonusEnabled.value}`;
  }

  function changeBonusAmount(dir) {
    const { bonusAmount } = store;

    if (dir === "plus") bonusAmount.value += BONUS_STEP;
    if (dir === "minus") {
      bonusAmount.value = Math.max(0, bonusAmount.value - BONUS_STEP);
    }

    logger.info`changeBonusAmount(${dir}) -> ${bonusAmount.value}`;
  }

  return {
    prepareStore,
    changeTournDate,
    updateTourResults,
    toggleWatchMode,
    togglePrize,
    toggleBonus,
    changeBonusAmount,
  };
}
