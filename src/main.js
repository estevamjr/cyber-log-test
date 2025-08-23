require('reflect-metadata');
require('module-alias/register');

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();