import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { loadRuntimeConfig } from './config/runtime.config';
import { EquipmentsModule } from './equipments/equipments.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { HealthModule } from './health/health.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const runtimeConfig = loadRuntimeConfig();

        return {
          type: 'postgres' as const,
          host: runtimeConfig.database.host,
          port: runtimeConfig.database.port,
          username: runtimeConfig.database.username,
          password: runtimeConfig.database.password,
          database: runtimeConfig.database.name,
          autoLoadEntities: true,
          synchronize: runtimeConfig.database.synchronize,
        };
      },
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    FacilitiesModule,
    EquipmentsModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
