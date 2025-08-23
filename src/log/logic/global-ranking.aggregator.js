/**
 * Agrega os dados de todas as partidas para gerar um ranking global.
 */
function aggregateGlobalRanking(allMatches) {
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

  const rankingArray = Object.entries(playerStats)
    .map(([player, stats]) => ({
      player,
      total_frags: stats.total_frags,
      total_deaths: stats.total_deaths,
    }))
    .filter(p => p.total_frags > 0 || p.total_deaths > 0);

  rankingArray.sort((a, b) => b.total_frags - a.total_frags);
  
  return rankingArray;
}

module.exports = { aggregateGlobalRanking };