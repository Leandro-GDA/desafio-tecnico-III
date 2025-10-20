import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ExameService } from './exame.service';
import { CriarExameDto } from './dto/criar-exame.dto';

@Controller('/exames')
export class ExameController {
  constructor(private readonly exameService: ExameService) {}

  @Post()
  async criaExame(@Body() dadosExame: CriarExameDto) {
    return this.exameService.criaExame(dadosExame);
  }

  @Get()
  async listaExames(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
  ) {
    return this.exameService.listaExames(page, pageSize);
  }
}
