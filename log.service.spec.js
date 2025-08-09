const LogService = require('../src/log.service');

describe('LogService', () => {
  let service;

  beforeEach(() => {
    service = new LogService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('same matchId from a log line', () => {
    const logLine = '23/04/2019 15:34:22 - New match 11348965 has started';
    const matchId = '11348965';

    const finalMatchId = service.matchId(logLine);

    expect(finalMatchId).toBe(matchId);
  });
});