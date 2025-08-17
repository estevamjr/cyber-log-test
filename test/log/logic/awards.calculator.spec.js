import { calculateAwards } from '@/log/logic/awards.calculator';

describe('AwardsCalculator', () => {
  it('deve conceder FLAWLESS_VICTORY para o vencedor sem mortes', () => {
    const ranking = [{ player: 'Winner', frags: 10 }];
    const deaths = { 'Loser': 1 };
    const killTimestamps = {};
    const expectedAwards = [{ player: 'Winner', award: 'FLAWLESS_VICTORY' }];
    expect(calculateAwards(ranking, deaths, killTimestamps)).toEqual(expectedAwards);
  });

  it('deve conceder KILLING_SPREE para 5 abates em menos de 60 segundos', () => {
    const ranking = [{ player: 'SpreePlayer', frags: 5 }];
    const deaths = {};
    const killTimestamps = { 'SpreePlayer': [10, 20, 30, 40, 55] };
    const expectedAwards = expect.arrayContaining([{ player: 'SpreePlayer', award: 'KILLING_SPREE' }]);
    expect(calculateAwards(ranking, deaths, killTimestamps)).toEqual(expectedAwards);
  });
});