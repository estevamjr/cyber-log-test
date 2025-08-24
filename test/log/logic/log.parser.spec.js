import { parseLogLine } from '@/log/logic/log.parser';

describe('LogParser', () => {
  it('deve retornar null para uma linha irrelevante', () => {
    const line = 'Some random text in the log';
    expect(parseLogLine(line)).toBeNull();
  });

  it('deve parsear um evento de PLAYER_KILL corretamente', () => {
    const line = '21:07:42 - Player1 killed Player2 using M4A1';
    const expected = {
      type: 'PLAYER_KILL',
      payload: { time: '21:07:42', killer: 'Player1', victim: 'Player2', weapon: 'M4A1' },
    };
    expect(parseLogLine(line)).toEqual(expected);
  });

  it('deve parsear um evento de WORLD_KILL corretamente', () => {
    const line = '21:08:59 - <WORLD> killed Player1 by DROWN';
    const expected = {
      type: 'WORLD_KILL',
      payload: { victim: 'Player1' },
    };
    expect(parseLogLine(line)).toEqual(expect.objectContaining(expected));
  });
  
  it('deve parsear um evento de NEW_MATCH corretamente', () => {
    const line = '21:07:22 - New match 11348965 has started';
    const expected = {
      type: 'NEW_MATCH',
      payload: { matchId: '11348965' },
    };
    expect(parseLogLine(line)).toEqual(expected);
  });
});