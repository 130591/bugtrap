import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { CommonParam, CommonResponse, ICommonParams } from '@src/shared/lib/apicommon'
import { Roles } from '@src/shared/framework/decorators'
import { RoleGuard } from '@src/shared/framework/guards'
import { AccountRegisterService } from '@src/identity/core/services/account-register'
import { ListAccountService } from '@src/identity/core/services'
import { GetAccountResponseDto, RegisterAccountDto, RegisterAccountResponseDto } from '../dto'

@Controller('/identity/account')
export class AccountController {
	constructor(
		private readonly listAccount: ListAccountService,
		private readonly registerService: AccountRegisterService
	) {}

	@Roles('create:users')
  @UseGuards(RoleGuard)
	@Post('/register')
	@CommonResponse({
		type: [RegisterAccountResponseDto],
		status: 201
	})
	async register(@Body() registerDto: RegisterAccountDto) {
		await this.registerService.execute({
			email: registerDto.email,
			userId: registerDto.userId,
			termsAccepted: registerDto.termsAccepted,
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
	async infoAccount(
		@CommonParam() params: ICommonParams,
		@Param('accountId') accountId: string,
		@Query() queryParams: any) {
			const { 
				page = 1,  
				limit = 12, 
				orderBy = 'createdAt', 
				orderDirection = 'DESC' 
			} = queryParams

		const { count, result, nextPage } =  await this.listAccount.execute({
      accountId,
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