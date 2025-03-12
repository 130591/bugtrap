import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { CommonResponse, CommonParam, ICommonParams } from '@src/shared/lib/apicommon'
import { CreateService } from '@src/project/core/service/create'
import { ListService } from '@src/project/core/service/list'
import { CreateProjectRequestDto, ResponseDto } from '../dto'

@Controller('/project')
export class ProjectController {
  constructor(
    private readonly create: CreateService, 
    private readonly list: ListService) {}

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


  @Get('/:accountId')
  @CommonResponse({
    isPaginated: true,
    defaultLimit: 12,
    maxLimit: 20,
    isSorted: true,
    type: [CreateProjectRequestDto]
  })
  async listProject(
    @Param('accountId') accountId: string,
    @Query() queryParams: any,
    @CommonParam() params: ICommonParams
  ) {
    const { 
      page = 1,  
      limit = 20, 
      orderBy = 'createdAt', 
      orderDirection = 'DESC' 
    } = queryParams
  
    const { count, result } = await this.list.execute({
      accountId,
      page: Number(page),
      limit: Math.min(Number(limit), 20),
      orderBy,
      orderDirection,
    })

    params.setPaginationInfo({
      count,
      offset: Number(page),
      limit: Math.min(Number(limit), 20)
    })
    
    return result
  }
}