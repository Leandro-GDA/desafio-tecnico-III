import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PacienteEntity } from './paciente.entity';
import { Repository } from 'typeorm';
import { ListaPacienteDTO } from './dto/lista-paciente.dto';
import { AtualizaPacienteDto } from './dto/atualiza.paciente.dto';
import { CriaPacienteDto } from './dto/criar-paciente.dto';

@Injectable()
export class PacienteService {
  constructor(
    @InjectRepository(PacienteEntity)
    private readonly pacienteRepository: Repository<PacienteEntity>,
  ) {}

  async criaPaciente(dadosPaciente: CriaPacienteDto) {
    const pacienteEntity = this.pacienteRepository.create(dadosPaciente);
    return this.pacienteRepository.save(pacienteEntity);
  }

  async listaPacientes(page: number, pageSize: number) {
    const [data, total] = await this.pacienteRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: data.map((p) => new ListaPacienteDTO(p.id, p.nome)),
      total,
      page,
      lastPage: Math.ceil(total / pageSize),
    };
  }

  async cpfExiste(cpf: string) {
    const pacienteComCpf = await this.pacienteRepository.count({
      where: { cpf },
    });
    return pacienteComCpf > 0;
  }

  async atualizaPaciente(id: string, novosDados: AtualizaPacienteDto) {
    const result = await this.pacienteRepository.update(id, novosDados);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Paciente com ID "${id}" não foi encontrado.`,
      );
    }
  }

  async deletaPaciente(id: string) {
    const result = await this.pacienteRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Paciente com ID "${id}" não foi encontrado.`,
      );
    }
  }
}
