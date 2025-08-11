const { Injectable, Inject, forwardRef } = require('@nestjs/common');

@Injectable()
class LogService {
  constructor(
    @Inject(forwardRef(() => require('./data/log.repository').LogRepository))
    logRepository,
  ) {
    this.repository = logRepository;
  }

  async processAndSaveLog(logContent, teams = {}) {
    const matchLogChunks = this._splitLogIntoMatchChunks(logContent);

    const reports = matchLogChunks
      .map(chunk => this._generateReportForMatch(chunk, teams))
      .filter(report => report !== null);

    if (reports.length > 0) {
      return this.repository.saveMatchReports(reports);
    }
    return [];
  }

  async getGlobalRanking() {
    const allMatches = await this.repository.getAllMatchReports();
    const playerStats = {};

    for (const match of allMatches) {
      const { report } = match;
      for (const player in report.kills) {
        if (!playerStats[player]) {
          playerStats[player] = { total_frags: 0, total_deaths: 0 };
        }
        playerStats[player].total_frags += report.kills[player];
      }
      for (const player in report.deaths) {
        if (!playerStats[player]) {
          playerStats[player] = { total_frags: 0, total_deaths: 0 };
        }
        playerStats[player].total_deaths += report.deaths[player];
      }
    }

    const rankingArray = Object.entries(playerStats).map(([player, stats]) => ({
      player,
      total_frags: stats.total_frags,
      total_deaths: stats.total_deaths,
    }));

    rankingArray.sort((a, b) => b.total_frags - a.total_frags);

    return rankingArray;
  }
  
  async getAllMatchesSummary() {
    const matches = await this.repository.getAllMatchReports();
    return matches.map(match => ({
      id: match.id,
      matchId: match.matchId
    }));
  }

  async getMatchById(matchId) {
    return this.repository.findMatchById(matchId);
  }

  async getMVReport() {
    const allMatches = await this.repository.getAllMatchReports();
    if (!allMatches || allMatches.length === 0) {
      return { message: 'Nenhuma partida encontrada para gerar o relatório MVP.' };
    }

    const playerAwards = {};
    const awardPoints = {
      'FLAWLESS_VICTORY': 5,
      'KILLING_SPREE': 3
    };

    for (const match of allMatches) {
      if (match.report && match.report.awards) {
        for (const awardInfo of match.report.awards) {
          const { player, award } = awardInfo;
          if (!playerAwards[player]) {
            playerAwards[player] = { score: 0, awards: [] };
          }
          playerAwards[player].score += (awardPoints[award] || 1);
          playerAwards[player].awards.push(award);
        }
      }
    }

    const championsRanking = Object.entries(playerAwards).map(([player, data]) => ({
      player,
      score: data.score,
      awards_summary: data.awards.reduce((acc, award) => {
        acc[award] = (acc[award] || 0) + 1;
        return acc;
      }, {})
    }));
    
    championsRanking.sort((a, b) => b.score - a.score);
    
    if (championsRanking.length === 0) {
        return { message: 'Não foi possível determinar um MVP claro (nenhum jogador com prêmios).' };
    }

    return championsRanking;
  }

  _buildPlayerTeamMap(teams) {
    const playerTeamMap = {};
    for (const team in teams) {
      for (const player of teams[team]) {
        playerTeamMap[player] = team;
      }
    }
    return playerTeamMap;
  }

  _timeToSeconds(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  _splitLogIntoMatchChunks(logContent) {
    const logLines = logContent.split('\n');
    const matches = [];
    let currentMatchLines = [];

    for (const line of logLines) {
      const isNewMatch = line.includes('New match');
      if (isNewMatch && currentMatchLines.length > 0) {
        matches.push(currentMatchLines);
        currentMatchLines = [];
      }
      if (line.trim()) {
        currentMatchLines.push(line);
      }
    }

    if (currentMatchLines.length > 0) {
      matches.push(currentMatchLines);
    }

    return matches;
  }

  _generateReportForMatch(matchLines, teams) {
    const matchIdRegex = /New match (\d+)/;
    const killRegex = /(\d{2}:\d{2}:\d{2}) - (.+) killed (.+) using (.+)/;
    const worldKillRegex = /(\d{2}:\d{2}:\d{2}) - <WORLD> killed (.+) by/;

    const firstLine = matchLines[0] || '';
    const matchIdResult = firstLine.match(matchIdRegex);
    if (!matchIdResult) {
      return null;
    }

    const kills = {};
    const deaths = {};
    const players = new Set();
    const currentStreaks = {};
    const highestStreaks = {};
    const killTimestamps = {};
    const killsByWeapon = {};

    const playerTeamMap = this._buildPlayerTeamMap(teams);

    for (const line of matchLines) {
      const killMatch = line.match(killRegex);
      const worldKillMatch = line.match(worldKillRegex);

      if (killMatch) {
        const [, time, killer, victim, weapon] = killMatch;
        players.add(killer);
        players.add(victim);
        
        const killerTeam = playerTeamMap[killer];
        const victimTeam = playerTeamMap[victim];
        
        if (killerTeam && killerTeam === victimTeam) {
          kills[killer] = (kills[killer] || 0) - 1;
        } else {
          kills[killer] = (kills[killer] || 0) + 1;
          if (!killsByWeapon[killer]) {
            killsByWeapon[killer] = {};
          }
          killsByWeapon[killer][weapon] = (killsByWeapon[killer][weapon] || 0) + 1;
        }
        
        deaths[victim] = (deaths[victim] || 0) + 1;

        currentStreaks[killer] = (currentStreaks[killer] || 0) + 1;
        if (currentStreaks[killer] > (highestStreaks[killer] || 0)) {
          highestStreaks[killer] = currentStreaks[killer];
        }
        currentStreaks[victim] = 0;

        if (!killTimestamps[killer]) {
          killTimestamps[killer] = [];
        }
        killTimestamps[killer].push(this._timeToSeconds(time));

      } else if (worldKillMatch) {
        const [, , victim] = worldKillMatch;
        players.add(victim);
        deaths[victim] = (deaths[victim] || 0) + 1;
        
        currentStreaks[victim] = 0;
      }
    }
    
    const ranking = Object.entries(kills)
      .map(([player, frags]) => ({ player, frags }))
      .sort((a, b) => b.frags - a.frags);
      
    const awards = [];
    let winnerFavoriteWeapon = null;

    if (ranking.length > 0) {
      const topScore = ranking[0].frags;
      if (topScore > 0) {
        const winners = ranking.filter(p => p.frags === topScore);
        
        for (const winner of winners) {
          if (!deaths[winner.player]) {
            awards.push({ player: winner.player, award: 'FLAWLESS_VICTORY' });
          }
        }

        const mainWinnerName = winners[0].player;
        const winnerWeapons = killsByWeapon[mainWinnerName];
        if (winnerWeapons) {
          winnerFavoriteWeapon = Object.entries(winnerWeapons)
            .sort((a, b) => b[1] - a[1])[0][0];
        }
      }
    }

    const spreeAwardedPlayers = new Set();
    for (const player in killTimestamps) {
      const times = killTimestamps[player];
      if (times.length >= 5) {
        times.sort((a, b) => a - b);
        for (let i = 0; i <= times.length - 5; i++) {
          if (times[i + 4] - times[i] < 60) {
            spreeAwardedPlayers.add(player);
            break;
          }
        }
      }
    }
    
    spreeAwardedPlayers.forEach(player => {
      awards.push({ player, award: 'KILLING_SPREE' });
    });

    return {
      matchId: matchIdResult[1],
      report: {
        total_kills: Object.values(kills).filter(k => k > 0).reduce((a, b) => a + b, 0),
        players: Array.from(players),
        ranking,
        deaths,
        streaks: highestStreaks,
        awards,
        winner_favorite_weapon: winnerFavoriteWeapon
      },
    };
  }
}

module.exports = { LogService };