const { Injectable } = require('@nestjs/common');
const { InjectRepository } = require('@nestjs/typeorm');
const { Repository } = require('typeorm');
const { Match } = require('./log.entity');
import { Retry } from '../../common/decorators/retry.decorator';

@Injectable()
class LogRepository {
  constructor(
    @InjectRepository(Match)
    typeOrmRepo,
  ) {
    this.repository = typeOrmRepo;
  }

  async saveMatchReports(matchReports) {
    const newMatches = this.repository.create(matchReports);
    return this.repository.save(newMatches);
  }

  @Retry({ retries: 3, delay: 200 })
  async getAllMatchReports() {
    return this.repository.find();
  }

  async findMatchById(matchId) {
    return this.repository.findOne({ where: { matchId } });
  }
}

module.exports = { LogRepository };