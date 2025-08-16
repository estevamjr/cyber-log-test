import { parseLogLine } from './log.parser';

/**
 * Classe responsável por processar as linhas de log de uma partida,
 * aplicando as regras de negócio para construir o estado final da partida.
 */
export class MatchProcessor {
  constructor(playerTeamMap) {
    this.playerTeamMap = playerTeamMap;

    this.kills = {};
    this.deaths = {};
    this.players = new Set();
    this.currentStreaks = {};
    this.highestStreaks = {};
    this.killTimestamps = {};
    this.killsByWeapon = {};
  }

  /**
   * Método público principal. Recebe uma linha de log bruta,
   * a interpreta e atualiza o estado interno da partida.
   * @param {string} line - A linha de texto do log.
   */
  processLine(line) {
    const event = parseLogLine(line);

    if (!event) {
      return; 
    }

    switch (event.type) {
      case 'PLAYER_KILL':
        this.#processPlayerKill(event.payload);
        break;
      case 'WORLD_KILL':
        this.#processWorldKill(event.payload);
        break;
    }
  }

  /**
   * Retorna o estado final processado da partida.
   */
  getProcessedState() {
    return {
      kills: this.kills,
      deaths: this.deaths,
      players: this.players,
      highestStreaks: this.highestStreaks,
      killTimestamps: this.killTimestamps,
      killsByWeapon: this.killsByWeapon,
    };
  }

  /**
   * Calcula o total de abates da partida, desconsiderando friendly fire.
   */
  calculateTotalKills() {
    return Object.values(this.kills)
      .filter(k => k > 0)
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Calcula a arma favorita do vencedor com base no ranking.
   * @param {Array<{player: string, frags: number}>} ranking 
   */
  calculateWinnerFavoriteWeapon(ranking) {
    if (ranking.length === 0 || ranking[0].frags <= 0) {
      return null;
    }
    const mainWinnerName = ranking[0].player;
    const winnerWeapons = this.killsByWeapon[mainWinnerName];
    if (winnerWeapons) {
      return Object.entries(winnerWeapons)
        .sort((a, b) => b[1] - a[1])[0][0];
    }
    return null;
  }

  /**
   * Processa um evento de abate de jogador. (Método Privado)
   * @param {object} payload - O payload do evento: { time, killer, victim, weapon }.
   */
  #processPlayerKill(payload) {
    const { time, killer, victim, weapon } = payload;
    
    this.players.add(killer);
    this.players.add(victim);

    const killerTeam = this.playerTeamMap[killer];
    const victimTeam = this.playerTeamMap[victim];

    if (killerTeam && killerTeam === victimTeam) {
      this.kills[killer] = (this.kills[killer] || 0) - 1;
    } else {
      this.kills[killer] = (this.kills[killer] || 0) + 1;
      this.killsByWeapon[killer] = this.killsByWeapon[killer] || {};
      this.killsByWeapon[killer][weapon] = (this.killsByWeapon[killer][weapon] || 0) + 1;
    }

    this.deaths[victim] = (this.deaths[victim] || 0) + 1;

    this.currentStreaks[killer] = (this.currentStreaks[killer] || 0) + 1;
    if (this.currentStreaks[killer] > (this.highestStreaks[killer] || 0)) {
      this.highestStreaks[killer] = this.currentStreaks[killer];
    }
    this.currentStreaks[victim] = 0;

    this.killTimestamps[killer] = this.killTimestamps[killer] || [];
    this.killTimestamps[killer].push(this.#timeToSeconds(time));
  }

  /**
   * Processa um evento de morte pelo <WORLD>. (Método Privado)
   * @param {object} payload - O payload do evento: { victim }.
   */
  #processWorldKill(payload) {
    const { victim } = payload;

    this.players.add(victim);
    this.deaths[victim] = (this.deaths[victim] || 0) + 1;
    this.currentStreaks[victim] = 0;
  }
  
  #timeToSeconds(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
}