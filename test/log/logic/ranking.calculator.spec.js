import { calculateRanking } from '@/log/logic/ranking.calculator';

describe('RankingCalculator', () => {
  it('deve retornar um array vazio se o objeto de kills for nulo ou vazio', () => {
    expect(calculateRanking(null)).toEqual([]);
    expect(calculateRanking({})).toEqual([]);
  });

  it('deve transformar um objeto de kills em um ranking ordenado', () => {
    const kills = { 'PlayerB': 5, 'PlayerA': 10, 'PlayerC': -1 };
    const expectedRanking = [
      { player: 'PlayerA', frags: 10 },
      { player: 'PlayerB', frags: 5 },
      { player: 'PlayerC', frags: -1 },
    ];
    expect(calculateRanking(kills)).toEqual(expectedRanking);
  });
});