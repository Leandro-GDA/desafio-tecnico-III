import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteController } from './pacientes/paciente.controller';
import { MysqlConfigService } from './config/mysql.config.service';
import { ConfigModule } from '@nestjs/config';
import { PacienteModule } from './pacientes/paciente.module';
import { ExameModule } from './exames/exame.module';

@Module({
  imports: [
    PacienteModule,
    ExameModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: MysqlConfigService,
      inject: [MysqlConfigService],
    }),
  ],
})
export class AppModule {}
