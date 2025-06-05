import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, IsUUID } from 'class-validator'

export class RegisterUser {
  @IsNotEmpty({ message: 'Email é obrigatório.' })
  @IsEmail({}, { message: 'Formato de email inválido.' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @IsString({ message: 'Senha deve ser uma string.' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres.' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string.' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  organizationId?: string;
}