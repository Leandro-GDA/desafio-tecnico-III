import { PartialType } from '@nestjs/mapped-types';
import { CriaPacienteDto } from './criar-paciente.dto';

export class AtualizaPacienteDto extends PartialType(CriaPacienteDto) {}
