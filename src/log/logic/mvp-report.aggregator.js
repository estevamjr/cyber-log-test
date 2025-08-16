/**
 * Agrega os dados de todas as partidas para gerar um relatório de MVP.
 * @param {Array<Match>} allMatches - A lista de todas as partidas do banco.
 * @returns {Array<{player: string, score: number, awards_summary: object}>} O relatório de MVP.
 */
export function aggregateMvpReport(allMatches) {
  if (!allMatches || allMatches.length === 0) {
    return { message: 'Nenhuma partida encontrada para gerar o relatório MVP.' };
  }
  
  const awardPoints = { 'FLAWLESS_VICTORY': 5, 'KILLING_SPREE': 3 };

  // console.time('Agregação MVP Report (Arch Refatorada com reduce)');

  const playerAwards = allMatches.reduce((acc, match) => {
    if (match.report && match.report.awards) {
      for (const awardInfo of match.report.awards) {
        const { player, award } = awardInfo;
        if (!acc[player]) {
          acc[player] = { score: 0, awards: [] };
        }
        acc[player].score += (awardPoints[award] || 1);
        acc[player].awards.push(award);
      }
    }
    return acc;
  }, {});
  
  // console.timeEnd('Agregação MVP Report (Arch Refatorada com reduce)');

  const championsRanking = Object.entries(playerAwards).map(([player, data]) => ({
    player,
    score: data.score,
    awards_summary: data.awards.reduce((acc, award) => {
      acc[award] = (acc[award] || 0) + 1;
      return acc;
    }, {})
  }));
  
  championsRanking.sort((a, b) => b.score - a.score);
  
  if (championsRanking.length === 0) {
      return { message: 'Não foi possível determinar um MVP claro (nenhum jogador com prêmios).' };
  }

  return championsRanking;
}