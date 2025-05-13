import { IsUUID, IsEmail } from 'class-validator'

export class AddUserAsOwnerCommand {
  @IsUUID()
  projectId: string

  @IsEmail()
  userEmail: string
}
