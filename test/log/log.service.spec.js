const { Test } = require('@nestjs/testing');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { LogService } = require('@/log/log.service');
const { Match } = require('@/log/data/log.entity');


describe('LogService', () => {
  let logService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LogService,
        {
          provide: getRepositoryToken(Match),
          useValue: mockRepository,
        },
      ],
    }).compile();

    logService = moduleRef.get(LogService);
  });

  it('deve processar um log e chamar o save com o formato correto', async () => {
    const logContent = `
       21:07:22 - New match 1 has started
       21:07:42 - Player1 killed Player2 using M4A1
     `;
    
    const expectedReportShape = {
      matchId: '1',
      report: expect.objectContaining({
        total_kills: 1,
      }),
    };
    
    await logService.processAndSaveLog(logContent);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(expectedReportShape)
      ])
    );
  });
});