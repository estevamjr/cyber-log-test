const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const LogModule = require('./log/log.module.js');
const { Match } = require('./log/data/log.entity.js');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Match],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    LogModule,
  ],
  controllers: [],
  providers: [],
})
class AppModule {}

module.exports = AppModule;