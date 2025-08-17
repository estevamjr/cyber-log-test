import { splitLogIntoMatchChunks } from '@/log/logic/log.splitter';

describe('LogSplitter', () => {
  it('deve retornar um array vazio para um log vazio', () => {
    const logContent = '';
    expect(splitLogIntoMatchChunks(logContent)).toEqual([]);
  });

  it('deve processar um log com uma única partida', () => {
    const logContent = `
      New match 1 has started
      Player1 killed Player2
      Match 1 has ended
    `.trim();
    const result = splitLogIntoMatchChunks(logContent);
    expect(result.length).toBe(1);
    expect(result[0].matchId).toBe('1');
    expect(result[0].lines.length).toBe(3);
  });

  it('deve dividir um log com múltiplas partidas corretamente', () => {
    const logContent = `
      New match 1 has started
      PlayerA killed PlayerB
      New match 2 has started
      PlayerC killed PlayerD
    `.trim();
    const result = splitLogIntoMatchChunks(logContent);
    expect(result.length).toBe(2);
    expect(result[0].matchId).toBe('1');
    expect(result[1].matchId).toBe('2');
  });
});