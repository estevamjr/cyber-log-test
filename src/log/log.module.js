const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { Match } = require('./data/log.entity');
const { LogRepository } = require('./data/log.repository');
const { LogService } = require('./log.service');
const { LogController } = require('./log.controller');

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
class LogModule {}

module.exports = LogModule;