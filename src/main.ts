/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Replace the default NestJS logger with Winston completely from startup
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger: WinstonModule.createLogger(winstonConfig),
    rawBody: true,
  });

  // 1. Configure Swagger Options
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('The API description for my NestJS + Drizzle project')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth() // Adds the "Authorize" button for JWTs
    .build();

  // 2. Create the Swagger Document
  const document = SwaggerModule.createDocument(app, config);

  // 3. Setup the Swagger UI at the '/api' route
  SwaggerModule.setup('api', app, document);

  // Enable CORS if needed
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
