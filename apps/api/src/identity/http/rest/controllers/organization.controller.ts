import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { CommonParam, CommonResponse, ICommonParams } from '@src/shared/lib/apicommon'
import { Roles } from '@src/shared/framework/decorators'
import { RoleGuard } from '@src/shared/framework/guards'
import { OrganizationRegisterService } from '@src/identity/core/services/organization-register'
import { ListOrganizationService } from '@src/identity/core/services'
import { GetAccountResponseDto, RegisterOrganizationAndUserDto, RegisterAccountResponseDto } from '../dto'

@Controller('/api/organization')
export class OrganizationController {
	constructor(
		private readonly listOrganization: ListOrganizationService,
		private readonly registerService: OrganizationRegisterService
	) {}

	@Roles('create:organization')
  @UseGuards(RoleGuard)
	@Post('/register')
	@CommonResponse({
		type: [RegisterAccountResponseDto],
		status: 201
	})
	async register(@Body() registerDto: RegisterOrganizationAndUserDto) {
		await this.registerService.execute({
			email: registerDto.organizationEmail,
			organizationName: registerDto.organizationName,
			portraitPhoto: registerDto.portraitImageBase64
		})
	}

	@Roles('read:users')
  @UseGuards(RoleGuard)
	@Get(':accountId')
	@CommonResponse({
		isPaginated: true,
		defaultLimit: 12,
		maxLimit: 20,
		isSorted: true,
		type: [GetAccountResponseDto]
	})
	async organizationInfo(
		@CommonParam() params: ICommonParams,
		@Param('organizationId') organizationId: string,
		@Query() queryParams: any) {
			const { 
				page = 1,  
				limit = 12, 
				orderBy = 'createdAt', 
				orderDirection = 'DESC' 
			} = queryParams

		const { count, result, nextPage } =  await this.listOrganization.execute({
      filters: { id: organizationId },
      page: Number(page),
      limit: Math.min(Number(limit), 20),
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
}