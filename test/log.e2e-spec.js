const { LogService } = require('../src/log/log.service');
const { LogRepository } = require('../src/log/data/log.repository');

jest.mock('../src/log/data/log.repository');

describe('LogService', () => { 
  let logService;
  let mockLogRepository;

  beforeEach(() => {
    mockLogRepository = {
      saveMatchReports: jest.fn(),
      getAllMatchReports: jest.fn(),
    };
    logService = new LogService(mockLogRepository);
  });

  it('deve processar um log e gerar o relatório correto para uma partida', async () => {
    const logContent = `
      21:07:22 - New match 1 has started
      21:07:42 - Player1 killed Player2 using M4A1
      21:08:12 - Player1 killed Player3 using M4A1
      21:08:59 - <WORLD> killed Player1 by FALLING
      21:09:22 - Match 1 has ended
    `;
    
    const expectedReport = {
      matchId: '1',
      report: {
        total_kills: 2,
        players: expect.arrayContaining(['Player1', 'Player2', 'Player3']),
        ranking: [
          { player: 'Player1', frags: 2 }
        ],
        deaths: {
          'Player1': 1,
          'Player2': 1,
          'Player3': 1
        },
        streaks: {
          'Player1': 2
        },
        awards: [],
        winner_favorite_weapon: 'M4A1'
      }
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReport)
      ])
    );
  });

  it('deve calcular corretamente o maior kill streak de cada jogador na partida', async () => {
    const logContent = `
      22:00:00 - New match 2 has started
      22:01:00 - PlayerA killed PlayerB using AK-47
      22:02:00 - PlayerA killed PlayerC using AK-47
      22:03:00 - PlayerC killed PlayerA using AWP
      22:04:00 - PlayerA killed PlayerB using AK-47
      22:05:00 - PlayerA killed PlayerC using AK-47
      22:06:00 - PlayerA killed PlayerB using AK-47
      22:07:00 - Match 2 has ended
    `;
    
    const expectedReport = {
      matchId: '2',
      report: {
        total_kills: 6,
        players: expect.arrayContaining(['PlayerA', 'PlayerB', 'PlayerC']),
        ranking: expect.arrayContaining([
          { player: 'PlayerA', frags: 5 },
          { player: 'PlayerC', frags: 1 }
        ]),
        deaths: {
          'PlayerA': 1,
          'PlayerB': 3,
          'PlayerC': 2
        },
        streaks: {
          'PlayerA': 3,
          'PlayerC': 1
        },
        awards: [],
        winner_favorite_weapon: 'AK-47'
      }
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReport)
      ])
    );
  });

  it('deve conceder o award "FLAWLESS_VICTORY" ao vencedor que não morreu', async () => {
    const logContent = `
      23:00:00 - New match 3 has started
      23:01:00 - PlayerVencedor killed PlayerPerdedor using DEAGLE
      23:02:00 - PlayerVencedor killed PlayerPerdedor using DEAGLE
      23:03:00 - Match 3 has ended
    `;
    
    const expectedReport = {
      matchId: '3',
      report: {
        total_kills: 2,
        players: expect.arrayContaining(['PlayerVencedor', 'PlayerPerdedor']),
        ranking: [{ player: 'PlayerVencedor', frags: 2 }],
        deaths: { 'PlayerPerdedor': 2 },
        streaks: { 'PlayerVencedor': 2 },
        awards: [{ player: 'PlayerVencedor', award: 'FLAWLESS_VICTORY' }],
        winner_favorite_weapon: 'DEAGLE'
      }
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReport)
      ])
    );
  });

  it('deve conceder o award "KILLING_SPREE" para 5 abates em menos de 1 minuto', async () => {
    const logContent = `
      10:00:00 - New match 4 has started
      10:01:10 - PlayerRampage killed PlayerA using AK-47
      10:01:25 - PlayerRampage killed PlayerB using AK-47
      10:01:40 - PlayerRampage killed PlayerC using AK-47
      10:01:55 - PlayerRampage killed PlayerD using AK-47
      10:02:05 - PlayerRampage killed PlayerE using AK-47
      10:03:00 - PlayerNormal killed PlayerA using M4A1
      10:05:00 - Match 4 has ended
    `;
    
    const expectedReport = {
      matchId: '4',
      report: {
        total_kills: 6,
        players: expect.arrayContaining(['PlayerRampage', 'PlayerA', 'PlayerB', 'PlayerC', 'PlayerD', 'PlayerE', 'PlayerNormal']),
        ranking: expect.arrayContaining([
          { player: 'PlayerRampage', frags: 5 },
          { player: 'PlayerNormal', frags: 1 }
        ]),
        deaths: { 'PlayerA': 2, 'PlayerB': 1, 'PlayerC': 1, 'PlayerD': 1, 'PlayerE': 1 },
        streaks: { 'PlayerRampage': 5, 'PlayerNormal': 1 },
        awards: expect.arrayContaining([
          { player: 'PlayerRampage', award: 'KILLING_SPREE' },
          { player: 'PlayerRampage', award: 'FLAWLESS_VICTORY' }
        ]),
        winner_favorite_weapon: 'AK-47'
      }
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReport)
      ])
    );
  });
  
  it('deve subtrair 1 ponto por friendly fire', async () => {
    const logContent = `
      11:00:00 - New match 5 has started
      11:01:00 - Player1 killed Player2 using USP-S
      11:02:00 - Player3 killed Player4 using AK-47
      11:03:00 - Match 5 has ended
    `;
    
    const teams = {
      'TeamA': ['Player1', 'Player2'],
      'TeamB': ['Player3', 'Player4'],
    };

    const expectedReport = {
      matchId: '5',
      report: {
        total_kills: 0,
        players: expect.arrayContaining(['Player1', 'Player2', 'Player3', 'Player4']),
        ranking: expect.arrayContaining([
          { player: 'Player1', frags: -1 },
          { player: 'Player3', frags: -1 },
        ]),
        deaths: {
          'Player2': 1,
          'Player4': 1
        },
        streaks: {
          'Player1': 1,
          'Player3': 1
        },
        awards: [],
        winner_favorite_weapon: null
      }
    };
    
    await logService.processAndSaveLog(logContent, teams);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReport)
      ])
    );
  });

  it('deve identificar a arma preferida do vencedor da partida', async () => {
    const logContent = `
      12:00:00 - New match 6 has started
      12:01:00 - Vencedor killed PlayerA using AK-47
      12:02:00 - Vencedor killed PlayerB using AK-47
      12:03:00 - Vencedor killed PlayerC using DEAGLE
      12:04:00 - PlayerA killed Vencedor using AWP
      12:05:00 - Match 6 has ended
    `;
    
    const expectedReport = {
      matchId: '6',
      report: {
        total_kills: 4,
        players: expect.arrayContaining(['Vencedor', 'PlayerA', 'PlayerB', 'PlayerC']),
        ranking: expect.arrayContaining([
          { player: 'Vencedor', frags: 3 },
          { player: 'PlayerA', frags: 1 }
        ]),
        deaths: {
          'PlayerA': 1,
          'PlayerB': 1,
          'PlayerC': 1,
          'Vencedor': 1
        },
        streaks: {
          'Vencedor': 3,
          'PlayerA': 1
        },
        awards: [],
        winner_favorite_weapon: 'AK-47'
      }
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReport)
      ])
    );
  });
});