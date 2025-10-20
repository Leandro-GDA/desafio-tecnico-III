import { ExameEntity } from '../exames/exame.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'pacientes' })
export class PacienteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome', length: 100, nullable: false })
  nome: string;

  @Column({ name: 'cpf', length: 20, unique: true, nullable: false })
  cpf: string;

  @Column({ type: 'date', name: 'data_nascimento', nullable: false })
  data_nascimento: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date | null;

  @OneToMany(() => ExameEntity, (exame) => exame.paciente)
  exames: ExameEntity[];
}
