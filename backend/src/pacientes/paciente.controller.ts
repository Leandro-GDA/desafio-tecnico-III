import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { ListaPacienteDTO } from './dto/lista-paciente.dto';
import { AtualizaPacienteDto } from './dto/atualiza.paciente.dto';
import { CriaPacienteDto } from './dto/criar-paciente.dto';

@Controller('/pacientes')
export class PacienteController {
  constructor(private pacienteService: PacienteService) {}

  @Post()
  async criaPaciente(@Body() dadosPaciente: CriaPacienteDto) {
    const pacienteCriado =
      await this.pacienteService.criaPaciente(dadosPaciente);

    return {
      paciente: new ListaPacienteDTO(pacienteCriado.id, pacienteCriado.nome),
      menssagem: 'Paciente cadastrado com sucesso',
    };
  }

  @Get()
  async listaPacientes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
  ) {
    return this.pacienteService.listaPacientes(page, pageSize);
  }

  @Patch(':id')
  async atualizaPaciente(
    @Param('id') id: string,
    @Body() dadosParaAtualizar: AtualizaPacienteDto,
  ) {
    await this.pacienteService.atualizaPaciente(id, dadosParaAtualizar);
    return { menssagem: 'Paciente atualizado com sucesso' };
  }

  @Delete(':id')
  async deletaPaciente(@Param('id') id: string) {
    await this.pacienteService.deletaPaciente(id);
    return {
      menssagem: 'Paciente deletado com sucesso',
    };
  }
}
