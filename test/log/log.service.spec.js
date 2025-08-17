const { LogService } = require('@/log/log.service');
const { LogRepository } = require('@/log/data/log.repository');

jest.mock('@/log/data/log.repository');

describe('LogService', () => {
  let logService;
  let mockLogRepository;

  beforeEach(() => {
    mockLogRepository = {
      saveMatchReports: jest.fn(),
      getAllMatchReports: jest.fn().mockResolvedValue([]),
    };
    logService = new LogService(mockLogRepository);
  });

  it('deve processar um log e chamar o save com o formato correto', async () => {
    // --- CORREÇÃO AQUI: Adicione timestamps às linhas ---
    const logContent = `
      21:07:22 - New match 1 has started
      21:07:42 - Player1 killed Player2 using M4A1
    `;
    
    const expectedReportShape = {
      matchId: '1',
      report: expect.objectContaining({
        total_kills: 1,
        players: expect.arrayContaining(['Player1', 'Player2']),
        ranking: expect.arrayContaining([{ player: 'Player1', frags: 1 }]),
      }),
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockLogRepository.saveMatchReports).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReportShape)
      ])
    );
  });
});