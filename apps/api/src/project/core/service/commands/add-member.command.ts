import { ArrayMaxSize, IsNotEmpty, IsUUID } from "class-validator"

export class InputAddMember {
	@IsUUID()
	@IsNotEmpty()
	projectId: string

	@IsUUID()
	@IsNotEmpty()
	@ArrayMaxSize(5)
	membersId: string[]

	@IsUUID()
  @IsNotEmpty()
  organizationId: string
}