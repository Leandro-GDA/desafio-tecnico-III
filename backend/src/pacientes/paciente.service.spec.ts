import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacienteService } from './paciente.service';
import { PacienteEntity } from './paciente.entity';
import { CriaPacienteDto } from './dto/criar-paciente.dto';
import { NotFoundException } from '@nestjs/common';
import { AtualizaPacienteDto } from './dto/atualiza.paciente.dto';
import { ListaPacienteDTO } from './dto/lista-paciente.dto';

describe('PacienteService', () => {
  let service: PacienteService;
  let repository: Repository<PacienteEntity>;

  const mockPacienteEntity: PacienteEntity = {
    id: 'a-uuid',
    nome: 'João da Silva',
    cpf: '123.456.789-00',
    data_nascimento: new Date('1990-01-01'),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    exames: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacienteService,
        {
          provide: getRepositoryToken(PacienteEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockPacienteEntity),
            save: jest.fn().mockResolvedValue(mockPacienteEntity),
            findAndCount: jest
              .fn()
              .mockResolvedValue([[mockPacienteEntity], 1]),
            count: jest.fn().mockResolvedValue(0),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PacienteService>(PacienteService);
    repository = module.get<Repository<PacienteEntity>>(
      getRepositoryToken(PacienteEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('criaPaciente', () => {
    it('should create a new patient successfully', async () => {
      const dadosPaciente: CriaPacienteDto = {
        nome: 'João da Silva',
        cpf: '123.456.789-00',
        data_nascimento: new Date('1990-01-01'),
      };

      const result = await service.criaPaciente(dadosPaciente);

      expect(repository.create).toHaveBeenCalledWith(dadosPaciente);
      expect(repository.save).toHaveBeenCalledWith(mockPacienteEntity);
      expect(result).toEqual(mockPacienteEntity);
    });
  });

  describe('listaPacientes', () => {
    it('should return a paginated list of patients', async () => {
      const page = 1;
      const pageSize = 10;
      const result = await service.listaPacientes(page, pageSize);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      expect(result.data[0]).toBeInstanceOf(ListaPacienteDTO);
      expect(result.data[0].id).toEqual(mockPacienteEntity.id);
      expect(result.total).toBe(1);
      expect(result.lastPage).toBe(1);
    });
  });

  describe('cpfExiste', () => {
    it('should return true if cpf exists', async () => {
      jest.spyOn(repository, 'count').mockResolvedValueOnce(1);
      const result = await service.cpfExiste('some-cpf');
      expect(result).toBe(true);
    });

    it('should return false if cpf does not exist', async () => {
      const result = await service.cpfExiste('some-cpf');
      expect(result).toBe(false);
    });
  });

  describe('atualizaPaciente', () => {
    it('should update a patient successfully', async () => {
      const novosDados: AtualizaPacienteDto = { nome: 'João Pereira' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce({ affected: 1, raw: [], generatedMaps: [] });

      await expect(
        service.atualizaPaciente(mockPacienteEntity.id, novosDados),
      ).resolves.not.toThrow();
      expect(repository.update).toHaveBeenCalledWith(
        mockPacienteEntity.id,
        novosDados,
      );
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      const novosDados: AtualizaPacienteDto = { nome: 'João Pereira' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValueOnce({ affected: 0, raw: [], generatedMaps: [] });

      await expect(
        service.atualizaPaciente('non-existing-id', novosDados),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletaPaciente', () => {
    it('should soft delete a patient successfully', async () => {
      jest
        .spyOn(repository, 'softDelete')
        .mockResolvedValueOnce({ affected: 1, raw: [], generatedMaps: [] });

      await expect(
        service.deletaPaciente(mockPacienteEntity.id),
      ).resolves.not.toThrow();
      expect(repository.softDelete).toHaveBeenCalledWith(mockPacienteEntity.id);
    });

    it('should throw NotFoundException if patient to delete does not exist', async () => {
      jest
        .spyOn(repository, 'softDelete')
        .mockResolvedValueOnce({ affected: 0, raw: [], generatedMaps: [] });

      await expect(service.deletaPaciente('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
