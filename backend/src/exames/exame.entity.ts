import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { PacienteEntity } from '../pacientes/paciente.entity';
import { ExameModalidade } from './enum/exame-modalidade.enum';

@Entity({ name: 'exames' })
@Index(['idempotency_key', 'paciente_id'], { unique: true })
export class ExameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 191 })
  idempotency_key: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  paciente_id: string;

  @Column({
    name: 'modalidade',
    type: 'enum',
    enum: ExameModalidade,
    nullable: false,
  })
  modalidade: ExameModalidade;

  @ManyToOne(() => PacienteEntity, (paciente) => paciente.exames, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'paciente_id' })
  paciente: PacienteEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date | null;
}
