/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Replace the default NestJS logger with Winston completely from startup
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Enable CORS if needed
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
