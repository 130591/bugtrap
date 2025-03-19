import { IsUUID, IsEmail, IsString, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator'

export class InviteMemberDto {
  @IsUUID()
  accountId: string;

  @IsUUID()
  hostId: string;

  @IsEmail()
  guestEmail: string;

  @IsUUID()
  projectId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[];
}



