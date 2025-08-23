const { Controller, Post, Get, Param, Body, UploadedFile, UseInterceptors, Inject, NotFoundException } = require('@nestjs/common');
const { FileInterceptor } = require('@nestjs/platform-express');
const { LogService } = require('./log.service');

@Controller('logs')
class LogController {
  constructor(
    @Inject(LogService)
    logService,
  ) {
    this.logService = logService;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Body() body) {
    if (!file) {
      return { message: 'No file uploaded.' };
    }
    
    let teams = {};
    if (body.teams) {
      try {
        teams = JSON.parse(body.teams);
      } catch (e) {
        return { message: 'Invalid teams JSON format.' };
      }
    }

    const logContent = file.buffer.toString();
    const processedMatches = await this.logService.processAndSaveLog(logContent, teams);

    return {
      message: `${processedMatches.length} matches processed and saved successfully!`,
      matches: processedMatches,
    };
  }

  @Get('ranking/global')
  async getGlobalRanking() {
    return this.logService.getGlobalRanking();
  }

  @Get('matches')
  async getAllMatches() {
    return this.logService.getAllMatchesSummary();
  }

  @Get('matches/mvp')
  async getMVReport() {
    return this.logService.getMVReport();
  }

  @Get('matches/:id')
  async getMatchDetails(@Param('id') matchId) {
    const match = await this.logService.getMatchById(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID "${matchId}" not found.`);
    }
    return match;
  }
}

module.exports = { LogController };