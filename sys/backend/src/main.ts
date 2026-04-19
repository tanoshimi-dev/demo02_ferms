import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadRuntimeConfig } from './config/runtime.config';

async function bootstrap() {
  const runtimeConfig = loadRuntimeConfig();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [runtimeConfig.frontendOrigin],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  await app.listen(runtimeConfig.port, '0.0.0.0');
}
void bootstrap();
