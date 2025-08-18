const { parseLogLine } = require('./log.parser');

/**
 * Divide o conteúdo de um arquivo de log em objetos de partida,
 * cada um contendo o ID da partida e um array de linhas de texto.
 * @param {string} logContent - O conteúdo completo do arquivo de log.
 * @returns {Array<{matchId: string, lines: Array<string>}>} Um array de objetos de partida.
 */
function splitLogIntoMatchChunks(logContent) {
  const logLines = logContent.split('\n');
  const matches = [];
  let currentMatchLines = [];

  for (const line of logLines) {
    const event = parseLogLine(line);
    const isNewMatch = event && event.type === 'NEW_MATCH';
    
    if (isNewMatch && currentMatchLines.length > 0) {
      const firstLineEvent = parseLogLine(currentMatchLines[0]);
      if (firstLineEvent && firstLineEvent.type === 'NEW_MATCH') {
        matches.push({
          matchId: firstLineEvent.payload.matchId,
          lines: currentMatchLines,
        });
      }
      currentMatchLines = [];
    }

    if (line.trim()) {
      currentMatchLines.push(line);
    }
  }

  if (currentMatchLines.length > 0) {
    const firstLineEvent = parseLogLine(currentMatchLines[0]);
    if (firstLineEvent && firstLineEvent.type === 'NEW_MATCH') {
      matches.push({
        matchId: firstLineEvent.payload.matchId,
        lines: currentMatchLines,
      });
    }
  }

  return matches;
}

module.exports = { splitLogIntoMatchChunks };