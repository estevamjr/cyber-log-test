const { Injectable, Inject, forwardRef } = require('@nestjs/common');

import { calculateAwards } from '@/log/logic/awards.calculator';
import { calculateRanking } from '@/log/logic/ranking.calculator';
import { MatchProcessor } from '@/log/logic/match.processor';
import { parseLogLine } from '@/log/logic/log.parser';
import { aggregateGlobalRanking } from '@/log/logic/global-ranking.aggregator';
import { aggregateMvpReport } from '@/log/logic/mvp-report.aggregator';
import { splitLogIntoMatchChunks } from '@/log/logic/log.splitter';

@Injectable()
class LogService {
  constructor(
    @Inject(forwardRef(() => require('@/log/data/log.repository').LogRepository))
    logRepository,
  ) {
    this.repository = logRepository;
  }

  async processAndSaveLog(logContent, teams = {}) {
    const matchLogChunks = splitLogIntoMatchChunks(logContent);
    
    const reports = matchLogChunks
      .map(chunk => this._generateReportForMatch(chunk.lines, chunk.matchId, teams))
      .filter(report => report !== null);

    if (reports.length > 0) {
      return this.repository.saveMatchReports(reports);
    }
    return [];
  }

  async getGlobalRanking() {
    const allMatches = await this.repository.getAllMatchReports();
    return aggregateGlobalRanking(allMatches);
  }
  
  async getMVReport() {
    const allMatches = await this.repository.getAllMatchReports();
    return aggregateMvpReport(allMatches);
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