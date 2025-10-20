import { Module } from '@nestjs/common';
import { ExameEntity } from './exame.entity';
import { ExameController } from './exame.controller';
import { ExameService } from './exame.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteEntity } from '../pacientes/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExameEntity, PacienteEntity])],
  controllers: [ExameController],
  providers: [ExameService],
})
export class ExameModule {}
