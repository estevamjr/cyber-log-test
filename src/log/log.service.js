const { Injectable } = require('@nestjs/common');
const { InjectRepository } = require('@nestjs/typeorm');
const { Match } = require('./data/log.entity');

const { calculateAwards } = require('@/log/logic/awards.calculator');
const { calculateRanking } = require('@/log/logic/ranking.calculator');
const { MatchProcessor } = require('@/log/logic/match.processor');
const { parseLogLine } = require('@/log/logic/log.parser');
const { aggregateGlobalRanking } = require('@/log/logic/global-ranking.aggregator');
const { aggregateMvpReport } = require('@/log/logic/mvp-report.aggregator');
const { splitLogIntoMatchChunks } = require('@/log/logic/log.splitter');

@Injectable()
class LogService {
  constructor(
    @InjectRepository(Match) 
    repository, 
  ) {
    this.repository = repository; 
  }
  
  async processAndSaveLog(logContent, teams = {}) {
    const matchLogChunks = splitLogIntoMatchChunks(logContent);
    
    const reports = matchLogChunks
      .map(chunk => this._generateReportForMatch(chunk.lines, chunk.matchId, teams))
      .filter(report => report !== null);

    if (reports.length > 0) {
      return this.repository.save(reports);
    }
    return [];
  }

  async getGlobalRanking() {
    const allMatches = await this.repository.find();
    return aggregateGlobalRanking(allMatches);
  }
  
  async getMVReport() {
    const allMatches = await this.repository.find();
    return aggregateMvpReport(allMatches);
  }

  async getAllMatchesSummary() {
    const matches = await this.repository.find();
    return matches.map(match => ({
      id: match.id,
      matchId: match.matchId
    }));
  }

  async getMatchById(matchId) {
    return this.repository.findOneBy({ matchId: matchId });
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
  
  _generateReportForMatch(matchLines, matchId, teams) {
    const playerTeamMap = this._buildPlayerTeamMap(teams);
    const matchProcessor = new MatchProcessor(playerTeamMap);

    matchLines.forEach(line => matchProcessor.processLine(line));

    const { 
      kills, deaths, players, highestStreaks, killTimestamps, killsByWeapon 
    } = matchProcessor.getProcessedState();
    
    const ranking = calculateRanking(kills);
    const awards = calculateAwards(ranking, deaths, killTimestamps);
    const total_kills = matchProcessor.calculateTotalKills();
    const winner_favorite_weapon = matchProcessor.calculateWinnerFavoriteWeapon(ranking);

    return {
      matchId: matchId,
      report: {
        total_kills,
        players: Array.from(players),
        ranking,
        deaths,
        streaks: highestStreaks,
        awards,
        winner_favorite_weapon,
      },
    };
  }
}

module.exports = { LogService };