require('dotenv').config();

const { NestFactory } = require('@nestjs/core');
const AppModule = require('./app.module.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();