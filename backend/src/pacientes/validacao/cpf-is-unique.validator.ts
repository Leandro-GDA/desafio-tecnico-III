import { Injectable } from '@nestjs/common';
import { PacienteService } from '../paciente.service';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true })
export class CpfIsUniqueValidator implements ValidatorConstraintInterface {
  constructor(private pacienteService: PacienteService) {}

  async validate(
    value: any,
    _validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const cpfJaCadastrado = await this.pacienteService.cpfExiste(value);
    return !cpfJaCadastrado;
  }
}

export const CpfIsUnique = (validationOptions: ValidationOptions) => {
  return (object: Object, propriedade: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propriedade,
      options: validationOptions,
      constraints: [],
      validator: CpfIsUniqueValidator,
    });
  };
};
