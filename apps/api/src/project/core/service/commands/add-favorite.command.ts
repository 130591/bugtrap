import { IsNotEmpty, IsUUID } from 'class-validator'

export class InputAddFavorite {
  @IsUUID()
  @IsNotEmpty()
  projectId: string

  @IsUUID()
  @IsNotEmpty()
  userId: string

  note?: string

  context?: string

  @IsUUID()
  @IsNotEmpty()
  organizationId: string
}
