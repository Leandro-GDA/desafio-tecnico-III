import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ExameModalidade } from '../enum/exame-modalidade.enum';

export class CriarExameDto {
  @IsUUID()
  @IsNotEmpty({ message: 'A ID do paciente não pode ser vazia' })
  paciente_id: string;

  @IsEnum(ExameModalidade, {
    message: `A modalidade deve ser uma das seguintes: ${Object.values(
      ExameModalidade,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'A modalidade não pode ser vazia' })
  modalidade: ExameModalidade;

  @IsUUID()
  idempotency_key: string;
}
