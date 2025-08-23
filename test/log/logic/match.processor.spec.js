import { MatchProcessor } from '@/log/logic/match.processor';

describe('MatchProcessor', () => {
  let matchProcessor;

  beforeEach(() => {
    const playerTeamMap = {};
    matchProcessor = new MatchProcessor(playerTeamMap);
  });

  it('deve contar kills e deaths corretamente', () => {
    matchProcessor.processLine('21:07:42 - Player1 killed Player2 using M4A1');
    matchProcessor.processLine('21:08:59 - <WORLD> killed Player1 by DROWN');

    const state = matchProcessor.getProcessedState();
    expect(state.kills).toEqual({ 'Player1': 1 });
    expect(state.deaths).toEqual({ 'Player2': 1, 'Player1': 1 });
  });

  it('deve subtrair um frag por friendly fire', () => {
    const playerTeamMap = { 'Player1': 'TeamA', 'Player2': 'TeamA' };
    const ffProcessor = new MatchProcessor(playerTeamMap);
    
    ffProcessor.processLine('21:07:42 - Player1 killed Player2 using M4A1');
    
    const state = ffProcessor.getProcessedState();
    expect(state.kills).toEqual({ 'Player1': -1 });
    expect(state.deaths).toEqual({ 'Player2': 1 });
  });
});