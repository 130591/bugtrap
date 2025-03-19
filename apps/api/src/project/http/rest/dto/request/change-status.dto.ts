import { ProjectStatus } from '@src/project/core/constants';
import { IsString, IsNotEmpty, } from 'class-validator'

export class ChangeStatusDto {
	@IsString()
	@IsNotEmpty()
	status: ProjectStatus
}
