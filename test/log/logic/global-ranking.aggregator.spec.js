import { aggregateGlobalRanking } from '@/log/logic/global-ranking.aggregator';

describe('GlobalRankingAggregator', () => {
  it('deve agregar os rankings de múltiplas partidas corretamente', () => {
    const allMatches = [
      { report: { ranking: [{ player: 'PlayerA', frags: 5 }], deaths: { 'PlayerB': 1 } } },
      { report: { ranking: [{ player: 'PlayerA', frags: 3 }, { player: 'PlayerB', frags: 1 }], deaths: { 'PlayerA': 1 } } },
      { report: { ranking: [{ player: 'PlayerB', frags: 2 }], deaths: { 'PlayerA': 1 } } },
      { report: { ranking: [{ player: 'PlayerC', frags: -1 }] } }, // Friendly fire, deve ser filtrado
    ];

    const result = aggregateGlobalRanking(allMatches);

    // O resultado esperado não contém o PlayerC, pois ele não teve frags positivos nem mortes.
    expect(result).toEqual([
      { player: 'PlayerA', total_frags: 8, total_deaths: 2 },
      { player: 'PlayerB', total_frags: 3, total_deaths: 1 },
    ]);
  });

  it('deve retornar um array vazio se não houver partidas', () => {
    const result = aggregateGlobalRanking([]);
    expect(result).toEqual([]);
  });
});