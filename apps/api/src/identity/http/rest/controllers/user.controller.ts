import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common'
import { Response, Request } from 'express'
import { SetAuthCookiesInterceptor } from '@src/shared/framework/interceptors'
import { CommonParam, CommonResponse, ICommonParams } from '@src/shared/lib/apicommon'
import { Roles } from '@src/shared/framework/decorators'
import { RoleGuard } from '@src/shared/framework/guards'
import { EditUserInfo, ListUserService, SignIn, UserRegister } from '@src/identity/core/services'
import { AuthenticateResponseDto, UserInfoResponseDto, UserRegisterResponseDto } from '../dto'
import { User } from '@src/identity/persist/entities/user.entity'
import { RefreshToken } from '@src/identity/core/services/refresh-token'


@Controller('/api/user')
export class UserController {
	constructor(
		private readonly users: ListUserService,
		private readonly editUserInfo: EditUserInfo,
		private readonly signIn: SignIn,
		private readonly userRegister: UserRegister,
		private readonly refreshToken: RefreshToken
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
		@Body() updates: Pick<User, 'firstName' | 'lastName'> & { avatar: string }
	) {
		return await this.editUserInfo.execute({ userId, updates })
	}

	@UseInterceptors(SetAuthCookiesInterceptor)
	@CommonResponse({
		type: [AuthenticateResponseDto],
		status: 201
	})
	@Post('/signin')
	async login(
		@Body() body: { payload: { email: string, password: string } }
	) {
		return await this.signIn.execute({ 
			email: body.payload.email, 
			password: body.payload.password 
		})
	}

	@Roles('update:users')
	@UseGuards(RoleGuard)
	@Patch('/reflesh/:userId')
	async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies['refresh_token']

		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token not found')
		}
	
		const newTokens = await this.refreshToken.execute({ refreshToken })
	
		res.cookie('access_token', newTokens.accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			domain: 'app.bugtrap.com',
			maxAge: 15 * 60 * 1000,
		})
		
		res.cookie('refresh_token', newTokens.refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			domain: 'app.bugtrap.com',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})
	
		return { userId: newTokens.userId }
	}

	@Post('/register')
	@CommonResponse({
		status: 201,
		type: [UserRegisterResponseDto]
	})
	async register(@Req() req: Request, @Body() payload: { email: string, password: string, firstName: string }) {
		return await this.userRegister.execute({ 
			email: payload.email, 
			password: payload.password, 
			firstName: payload.firstName 
		})
	}
}