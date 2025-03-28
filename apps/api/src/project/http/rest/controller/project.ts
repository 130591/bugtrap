import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CommonResponse, CommonParam, ICommonParams } from '@src/shared/lib/apicommon'
import { Roles } from '@src/shared/framework/decorators'
import { RoleGuard } from '@src/shared/framework/guards'
import { CreateService } from '@src/project/core/service/create'
import { ListService } from '@src/project/core/service/list'
import { 
  ChangeStatusDto, 
  ChangeStatusResponseDto, 
  CreateProjectRequestDto, 
  GetResponseDto, 
  InviteMemberDto, 
  ResponseDto, 
  ResponseInviteMemberDto 
} from '../dto'
import { InviteMemberService } from '@src/project/core/service/invite-member'
import { ConfirmInvitationService } from '@src/project/core/service/confirm-invite'
import { ChangeStatusService } from '@src/project/core/service/change-status'

@Controller('/project')
export class ProjectController {
  constructor(
    private readonly create: CreateService,
    private readonly changeStatus: ChangeStatusService,
    private readonly confirmInvitation: ConfirmInvitationService,
    private readonly inviteMember: InviteMemberService,
    private readonly list: ListService) {}

  @Roles('create:project')
  @UseGuards(RoleGuard)
  @Post()
  @CommonResponse({
    type: [ResponseDto],
    status: 201
  })
  async newProject(
    @Req() _req: Request,
    @Body() data: CreateProjectRequestDto,
  ) {
    return await this.create.perform(data)
  }

  @Roles('create:project')
  @UseGuards(RoleGuard)
  @Post('member')
  @CommonResponse({
    type: [ResponseInviteMemberDto],
    status: 201
  })
  async invite( @Req() _req: Request,
  @Body() data: InviteMemberDto) {
    return await this.inviteMember.execute(data)
  }

  @Roles('create:project')
  @UseGuards(RoleGuard)
  @Post(':projectId/invitations/:invitationId/confirm')
  async confirmInvite(
    @Param('projectId') projectId: string, 
    @Param('invitationId') invitationId: string,  
    @Body() data: { guestEmail: string }
  ) {
    return await this.confirmInvitation.execute({
      projectId: projectId, token: invitationId,
      guestEmail: data.guestEmail,
    })
  }

  @Roles('update:project')
  @UseGuards(RoleGuard)
  @Patch(':projectId/status')
  @CommonResponse({
    type: [ChangeStatusResponseDto],
    status: 201
  })
  async status(@Param('projectId') projectId: string,
  @Body() data: ChangeStatusDto) {
    return await this.changeStatus.execute({ 
      projectId: projectId , 
      status: data.status 
    })
  }

  @Roles('read:project')
  @UseGuards(RoleGuard)
  @Get(':accountId')
  @CommonResponse({
    isPaginated: true,
    defaultLimit: 12,
    maxLimit: 20,
    isSorted: true,
    type: [GetResponseDto]
  })
  async listProject(
    @Param('accountId') accountId: string,
    @Query() queryParams: any,
    @CommonParam() params: ICommonParams
  ) {
    const { 
      page = 1,  
      limit = 12, 
      orderBy = 'createdAt', 
      orderDirection = 'DESC' 
    } = queryParams

    const { count, result, nextPage } = await this.list.execute({
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
      limit: Math.min(Number(limit), 20),
    })
  
    return result
  }
}