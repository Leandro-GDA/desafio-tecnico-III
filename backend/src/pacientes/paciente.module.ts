import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteEntity } from './paciente.entity';
import { PacienteController } from './paciente.controller';
import { PacienteService } from './paciente.service';
import { CpfIsUniqueValidator } from './validacao/cpf-is-unique.validator';

@Module({
  imports: [TypeOrmModule.forFeature([PacienteEntity])],
  controllers: [PacienteController],
  providers: [PacienteService, CpfIsUniqueValidator],
})
export class PacienteModule {}
