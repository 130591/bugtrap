// @src/identity/register/commands/register-organization.ts
// (Você pode criar este arquivo ou ajustar o existente)

import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class RegisterOrganizationCommand {
  @IsNotEmpty({ message: 'Nome da organização é obrigatório.' })
  @IsString({ message: 'Nome da organização deve ser uma string.' })
  organizationName: string; // Reflete 'organizationName' na entidade

  @IsNotEmpty({ message: 'Email de contato da organização é obrigatório.' })
  @IsEmail({}, { message: 'Formato de email inválido para a organização.' })
  email: string; // Email de contato da organização

  // Se você tiver uma senha para a organização em si (muito raro)
  // @IsOptional()
  // @IsString()
  // @MinLength(6)
  // password?: string;

  // Campos como firstName, lastName, username e termsAccepted
  // geralmente pertencem ao registro de um usuário, não da organização.
  // Se forem para o usuário que CRIA a organização, eles devem ser passados para um serviço de UserRegister.
  // Por agora, estou removendo-os deste DTO, pois ele foca na Organização.
  // Se eles são realmente para a organização (ex: nome de contato), renomeie-os adequadamente.

	@IsOptional()
  @IsString({ message: 'Imagem do perfil deve ser uma string.' })
	portraitPhoto: string;
}
