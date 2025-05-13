import { IsEmail, IsString, IsUUID } from 'class-validator'

export class ConfirmInviteCommand {
  @IsUUID()
  projectId: string

  @IsEmail()
  guestEmail: string

  @IsString()
  token: string
}