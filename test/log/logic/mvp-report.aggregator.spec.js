import { aggregateMvpReport } from '@/log/logic/mvp-report.aggregator';

describe('MvpReportAggregator', () => {
  it('deve agregar os scores de MVP corretamente', () => {
    const allMatches = [
      { report: { awards: [{ player: 'PlayerA', award: 'FLAWLESS_VICTORY' }] } }, // 5 pontos
      { report: { awards: [{ player: 'PlayerB', award: 'KILLING_SPREE' }] } },    // 3 pontos
      { report: { awards: [{ player: 'PlayerA', award: 'KILLING_SPREE' }] } },    // 3 pontos
    ];

    const result = aggregateMvpReport(allMatches);
    
    // PlayerA: 5 + 3 = 8
    // PlayerB: 3
    expect(result[0]).toEqual(expect.objectContaining({ player: 'PlayerA', score: 8 }));
    expect(result[1]).toEqual(expect.objectContaining({ player: 'PlayerB', score: 3 }));
  });

  it('deve retornar uma mensagem se nenhuma partida for encontrada', () => {
    const result = aggregateMvpReport([]);
    expect(result).toEqual({ message: 'Nenhuma partida encontrada para gerar o relatório MVP.' });
  });
});