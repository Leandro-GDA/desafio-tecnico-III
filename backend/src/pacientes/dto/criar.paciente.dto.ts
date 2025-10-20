import { IsDate, IsNotEmpty } from 'class-validator';
import { CpfIsUnique } from '../validacao/cpf-is-unique.validator';
import { Transform } from 'class-transformer';

export class CriaPacienteDto {
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  nome: string;

  @IsNotEmpty({ message: 'CPF não pode ser vazio' })
  @CpfIsUnique({ message: 'CPF já cadastrado' })
  cpf: string;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Data de nascimento deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de nascimento não deve ser vazio' })
  data_nascimento: Date;
}
