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
  getChessArchUrlDate,
  getLastTournamentDate,
  getTournamentRegExp,
} from "@/server/utils.js";
import { batch } from "preact-signals-core";
import { getLogger } from "logtape";

const logger = getLogger([APP_NAME, "logic"]);

export function setupAtStartup(getGames) {
  changeTournamentDate(0, getGames);
}

export function setupTournament(isThursday, games, getGames) {
  const {
    isPrizeEnabled,
    isBonusEnabled,
    isWatchModeEnabled,
  } = store;

  isPrizeEnabled.value = isThursday;
  isBonusEnabled.value = false;

  updateResults(games);
  toggleWatchMode(games, getGames);
  if (!isWatchModeEnabled.value) {
    toggleWatchMode(games, getGames);
  }

  logger.info("tournament setuped");
}

/**
 * Устанавливает дату титульника через prev/next через -1|1 и 0 - последний
 */
export async function changeTournamentDate(off, getGames) {
  const { tournamentDate } = store;
  const ltd = getLastTournamentDate();
  let td;

  if (off === 0) {
    td = ltd;
  }
  if (off === 1) {
    const daysToAdd = tournamentDate.value.dayOfWeek === 2 ? 2 : 5;
    td = tournamentDate.value.add({ days: daysToAdd });
  }
  if (off === -1) {
    const daysToSubtract = tournamentDate.value.dayOfWeek === 2 ? 5 : 2;
    td = tournamentDate.value.subtract({ days: daysToSubtract });
  }

  if (Temporal.PlainDate.compare(td, ltd) > 0) {
    td = ltd;
  }

  tournamentDate.value = td;

  logger.info("tournamentDate changed: {td}", {
    td: tournamentDate.value.toString(),
  });

  // const chessArchDate = getChessArchUrlDate(td);
  // const games = await getGames( chessArchDate )

  // updateResults( games );
}

/**
 * Получает на вход массив игр для какого-то месяца
 * основываясь на дате титульника отфильтровывает то что нужно отфильтровать
 */
export function updateResults(games) {
  const { tournamentDate, gameResults } = store;

  const regexp = getTournamentRegExp(tournamentDate.value);

  const results = games.filter((g) => regexp.test(g.tournament ?? ""))
    .sort((a, b) => a.end_time - b.end_time).map((g) =>
      g.white.username === env.playerName
        ? [RESULTS[g.white.result], g.black.rating >= GM_SCORE]
        : [RESULTS[g.black.result], g.white.rating >= GM_SCORE]
    );

  gameResults.value = results;

  logger.info("gameResults changed: {results}", {
    results: gameResults.value,
  });
}

function watchLoop(getGames) {
  const { isWatchModeEnabled, watchModeAutoOff } = store;

  store.watchModeLoopTid = setTimeout(async () => {
    const games = await getGames();
    batch(() => {
      updateResults(games);
      watchModeAutoOff.value--;

      if (watchModeAutoOff.value <= 0) {
        isWatchModeEnabled.value = false;
        return;
      }

      watchLoop();
    });
  }, WATCH_MODE_INTERVAL);
}

export function toggleWatchMode(games, getGames) {
  const { isWatchModeEnabled, watchModeAutoOff } = store;
  isWatchModeEnabled.value = !isWatchModeEnabled.value;

  if (!isWatchModeEnabled.value) {
    watchModeAutoOff.value = 0;
    clearTimeout(store.watchModeLoopTid);
    return;
  }

  updateResults(games);
  watchModeAutoOff.value = WATCH_MODE_AUTO_OFF;
  watchLoop(getGames);
}

export function toggleBonus() {
  const { isBonusEnabled } = store;
  isBonusEnabled.value = !isBonusEnabled.value;
}

export function togglePrize() {
  const { isPrizeEnabled } = store;
  isPrizeEnabled.value = !isPrizeEnabled.value;
}
