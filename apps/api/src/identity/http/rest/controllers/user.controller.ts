import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { CommonParam, CommonResponse, ICommonParams } from '@src/shared/lib/apicommon'
import { Roles } from '@src/shared/framework/decorators'
import { RoleGuard } from '@src/shared/framework/guards'
import { EditUserInfo, ListUserService } from '@src/identity/core/services'
import { UserInfoResponseDto } from '../dto'

@Controller('/identity/user')
export class UserController {
	constructor(
		private readonly users: ListUserService,
		private readonly editUserInfo: EditUserInfo,
	) {}

	@Roles('read:users')
	@UseGuards(RoleGuard)
	@Get('me/:userId')
	@CommonResponse({
		isPaginated: true,
		defaultLimit: 12,
		maxLimit: 20,
		isSorted: true,
		type: [UserInfoResponseDto]
	})
	async me(
		@CommonParam() params: ICommonParams,
		@Param('userId') userId: string,
		@Query() queryParams: any) {
			const { 
				page = 1,  
				limit = 1, 
				orderBy = 'createdAt', 
				orderDirection = 'DESC' 
			} = queryParams	

		const { count, result, nextPage } = await this.users.execute({
			userId,
			page: Number(page),
			limit: Math.min(Number(limit), 1),
			orderBy,
			orderDirection,
		})
   
		params.setPaginationInfo({
			count,
			nextPage,
			offset: Number(page),
			limit: Math.min(Number(limit), 1),
		})

		return result
	}

	@CommonResponse({
		type: [UserInfoResponseDto],
		status: 201
	})
	@Roles('update:users')
	@UseGuards(RoleGuard)
	@Patch(':userId')
	async updateUser(
		@Param('userId') userId: string,
		@Body() updates: Record<string, any>
	) {
		return await this.editUserInfo.execute({ userId, updates })
	}
}