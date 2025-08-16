/**
 * Agrega os dados de todas as partidas para gerar um ranking global.
 * @param {Array<Match>} allMatches - A lista de todas as partidas do banco.
 * @returns {Array<{player: string, total_frags: number, total_deaths: number}>} O ranking global.
 */
export function aggregateGlobalRanking(allMatches) {
  // console.time('Agregação Global Ranking (Arch Refatorada com reduce)');
  
  const playerStats = allMatches.reduce((stats, match) => {
    const { report } = match;

    if (report.ranking) {
      for (const playerRank of report.ranking) {
        const { player, frags } = playerRank;
        stats[player] = stats[player] || { total_frags: 0, total_deaths: 0 };
        if (frags > 0) {
          stats[player].total_frags += frags;
        }
      }
    }

    if (report.deaths) {
      for (const player in report.deaths) {
        stats[player] = stats[player] || { total_frags: 0, total_deaths: 0 };
        stats[player].total_deaths += report.deaths[player];
      }
    }
    
    return stats;
  }, {});

  // console.timeEnd('Agregação Global Ranking (Arch Refatorada com reduce)');

  const rankingArray = Object.entries(playerStats).map(([player, stats]) => ({
    player,
    total_frags: stats.total_frags,
    total_deaths: stats.total_deaths,
  }));

  rankingArray.sort((a, b) => b.total_frags - a.total_frags);
  return rankingArray;
}