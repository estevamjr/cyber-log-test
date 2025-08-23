const matchIdRegex = /New match (\d+)/;
const killRegex = /(\d{2}:\d{2}:\d{2}) - (.+) killed (.+) using (.+)/;
const worldKillRegex = /(\d{2}:\d{2}:\d{2}) - <WORLD> killed (.+) by/;

/**
 * Analisa (parse) uma única linha de um arquivo de log.
 * Retorna um objeto de evento estruturado se a linha for relevante, caso contrário, retorna null.
 */
function parseLogLine(line) {
  const trimmedLine = line.trim();

  const killMatch = trimmedLine.match(killRegex);
  if (killMatch) {
    const [, time, killer, victim, weapon] = killMatch;
    return { type: 'PLAYER_KILL', payload: { time, killer, victim, weapon } };
  }

  const worldKillMatch = trimmedLine.match(worldKillRegex);
  if (worldKillMatch) {
    const [, , victim] = worldKillMatch;
    return { type: 'WORLD_KILL', payload: { victim } };
  }
  
  const newMatch = trimmedLine.match(matchIdRegex)
  if (newMatch) {
      const [, matchId] = newMatch
      return { type: "NEW_MATCH", payload: { matchId } }
  }

  return null;
}

module.exports = { parseLogLine };