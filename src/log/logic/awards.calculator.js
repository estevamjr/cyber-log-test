/**
 * Calcula os prêmios (awards) de uma partida com base nas estatísticas finais.
 */
function calculateAwards(ranking, deaths, killTimestamps) {
  const awards = [];
  if (!ranking || ranking.length === 0) {
    return awards;
  }

  const topScore = ranking[0].frags;
  if (topScore > 0) {
    const winners = ranking.filter(p => p.frags === topScore);
    for (const winner of winners) {
      if (!deaths[winner.player]) {
        awards.push({ player: winner.player, award: 'FLAWLESS_VICTORY' });
      }
    }
  }

  const spreeAwardedPlayers = new Set();
  for (const player in killTimestamps) {
    const times = killTimestamps[player];
    if (times.length >= 5) {
      times.sort((a, b) => a - b);
      for (let i = 0; i <= times.length - 5; i++) {
        if (times[i + 4] - times[i] < 60) {
          spreeAwardedPlayers.add(player);
          break;
        }
      }
    }
  }

  spreeAwardedPlayers.forEach(player => {
    awards.push({ player, award: 'KILLING_SPREE' });
  });

  return awards;
}

module.exports = { calculateAwards };