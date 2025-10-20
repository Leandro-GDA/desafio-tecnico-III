import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExameService } from './exame.service';
import { ExameEntity } from './exame.entity';
import { PacienteEntity } from '../pacientes/paciente.entity';
import { NotFoundException } from '@nestjs/common';
import { CriarExameDto } from './dto/criar-exame.dto';
import { ExameModalidade } from './enum/exame-modalidade.enum';

const mockPacienteEntity: PacienteEntity = {
  id: 'paciente-uuid',
  nome: 'João da Silva',
  cpf: '123.456.789-00',
  data_nascimento: new Date('1990-01-01'),
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
  exames: [],
};

const mockExameEntity: ExameEntity = {
  id: 'exame-uuid',
  idempotency_key: 'idempotency-uuid',
  paciente_id: mockPacienteEntity.id,
  modalidade: ExameModalidade.CT,
  paciente: mockPacienteEntity,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null, // Correção de tipo feita em exame.entity.ts
};

describe('ExameService', () => {
  let service: ExameService;
  let exameRepository: Repository<ExameEntity>;
  let pacienteRepository: Repository<PacienteEntity>;
  let dataSource: DataSource;

  const mockTransactionManager = {
    findOne: jest.fn(),
    create: jest.fn().mockReturnValue(mockExameEntity),
    save: jest.fn().mockResolvedValue(mockExameEntity),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExameService,
        {
          provide: getRepositoryToken(ExameEntity),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([[mockExameEntity], 1]),
          },
        },
        {
          provide: getRepositoryToken(PacienteEntity),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(mockPacienteEntity),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (cb) => {
              return cb(mockTransactionManager);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ExameService>(ExameService);
    exameRepository = module.get<Repository<ExameEntity>>(
      getRepositoryToken(ExameEntity),
    );
    pacienteRepository = module.get<Repository<PacienteEntity>>(
      getRepositoryToken(PacienteEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criaExame', () => {
    const criarExameDto: CriarExameDto = {
      paciente_id: mockPacienteEntity.id,
      modalidade: ExameModalidade.CT,
      idempotency_key: 'idempotency-uuid',
    };

    it('should create a new exam if idempotency key is new', async () => {
      mockTransactionManager.findOne.mockResolvedValue(null);

      const result = await service.criaExame(criarExameDto);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(ExameEntity, {
        where: {
          idempotency_key: criarExameDto.idempotency_key,
          paciente_id: criarExameDto.paciente_id,
        },
      });
      expect(pacienteRepository.findOneBy).toHaveBeenCalledWith({
        id: criarExameDto.paciente_id,
      });
      expect(mockTransactionManager.create).toHaveBeenCalled();
      expect(mockTransactionManager.save).toHaveBeenCalledWith(mockExameEntity);
      expect(result).toEqual(mockExameEntity);
    });

    it('should return an existing exam if idempotency key is repeated', async () => {
      mockTransactionManager.findOne.mockResolvedValue(mockExameEntity);

      const result = await service.criaExame(criarExameDto);

      expect(mockTransactionManager.findOne).toHaveBeenCalledTimes(1);
      expect(pacienteRepository.findOneBy).not.toHaveBeenCalled();
      expect(mockTransactionManager.create).not.toHaveBeenCalled();
      expect(mockTransactionManager.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockExameEntity);
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      mockTransactionManager.findOne.mockResolvedValue(null);
      jest.spyOn(pacienteRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.criaExame(criarExameDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle race condition by returning the existing exam', async () => {
      mockTransactionManager.findOne.mockResolvedValueOnce(null);

      jest
        .spyOn(pacienteRepository, 'findOneBy')
        .mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      mockTransactionManager.findOne.mockResolvedValueOnce(mockExameEntity);

      const result = await service.criaExame(criarExameDto);

      expect(result).toEqual(mockExameEntity);

      expect(pacienteRepository.findOneBy).toHaveBeenCalledWith({
        id: criarExameDto.paciente_id,
      });
    });
  });

  describe('listaExames', () => {
    it('should return a paginated list of exams', async () => {
      const result = await service.listaExames(1, 10);

      expect(exameRepository.findAndCount).toHaveBeenCalled();
      expect(result.data).toEqual([mockExameEntity]);
      expect(result.total).toBe(1);
    });
  });
});
