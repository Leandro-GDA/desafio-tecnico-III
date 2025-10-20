import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExameEntity } from './exame.entity';
import { PacienteEntity } from '../pacientes/paciente.entity';
import { CriarExameDto } from './dto/criar-exame.dto';

@Injectable()
export class ExameService {
  constructor(
    @InjectRepository(ExameEntity)
    private readonly exameRepository: Repository<ExameEntity>,
    @InjectRepository(PacienteEntity)
    private readonly pacienteRepository: Repository<PacienteEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private async buscaPaciente(id: string) {
    const paciente = await this.pacienteRepository.findOneBy({ id });
    if (paciente === null) {
      throw new NotFoundException(
        `Paciente com ID "${id}" não foi encontrado.`,
      );
    }
    return paciente;
  }

  async criaExame(dadosExame: CriarExameDto) {
    return this.dataSource.transaction(async (manager) => {
      const exameExistente = await manager.findOne(ExameEntity, {
        where: {
          idempotency_key: dadosExame.idempotency_key,
          paciente_id: dadosExame.paciente_id,
        },
      });

      if (exameExistente) {
        return exameExistente;
      }

      try {
        const paciente = await this.buscaPaciente(dadosExame.paciente_id);
        const novoExame = manager.create(ExameEntity, {
          ...dadosExame,
          paciente,
        });
        return await manager.save(novoExame);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          const exameCriadoConcorrentemente = await manager.findOne(
            ExameEntity,
            {
              where: {
                idempotency_key: dadosExame.idempotency_key,
                paciente_id: dadosExame.paciente_id,
              },
            },
          );
          if (!exameCriadoConcorrentemente) throw error;
          return exameCriadoConcorrentemente;
        }
        throw error;
      }
    });
  }

  async listaExames(page: number, pageSize: number) {
    const [data, total] = await this.exameRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: {
        paciente: true,
      },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / pageSize),
    };
  }
}
