import { IsUUID, IsEmail, IsNotEmpty } from 'class-validator'

export class AddUserAsOwnerCommand {
  @IsUUID()
  projectId: string

  @IsEmail()
  userEmail: string

  @IsUUID()
  @IsNotEmpty()
  organizationId: string
}
