import { ConflictException, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { LoggerService } from '@src/shared/lib/logger'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ExternalIdentityClient } from '@src/project/http/client'
import { AddMemberLogs } from './logger'
import { Membership } from './policies'
import { InputAddMember } from './commands'


@Injectable()
@UseInterceptors(LoggingInterceptor)
export class AddMemberService {
  constructor(
    private readonly logger: LoggerService,
    private readonly event: BrokerService,
    private readonly projectRepository: ProjectRepository,
    private readonly publicAPI: ExternalIdentityClient,
  ) {}

  private async ensureAllUsersExist(membersId: string[]): Promise<any[]> {
    const users = await Promise.all(membersId.map(id => this.publicAPI.findUserById(id)))
    
    if (users.some(user => !user)) {      
      throw new NotFoundException('One or more users not found')
    }
    return users
  }

  @Transactional()
  async execute(command: InputAddMember): Promise<void> {
    const requestingUserId = command.projectId || 'unknown_user'

    const [_, project] = await Promise.all([
      this.ensureAllUsersExist(command.membersId),
      this.projectRepository.find({
        where: { id: command.projectId },
        relations: ['members'],
      })
    ])

    if (!project) throw new NotFoundException('Project not found')
    
    const currentMemberIds = project.members.map(member => member.id)
    
    try {
      Membership.checkPolicies(project.status, currentMemberIds, command.membersId)
    } catch (error) {
      AddMemberLogs.policyViolation(
        this.logger,
        requestingUserId,
        project.id,
        command.membersId,
        error.message
      )

      throw error
    }
    
    const results = await Promise.allSettled(
      command.membersId.map(memberId =>
        this.projectRepository.addMember(command.projectId, memberId, 'member')
      )
    )

    const fulfilledCount = results.filter(r => r.status === 'fulfilled').length
    const rejectedCount = results.filter(r => r.status === 'rejected').length

    if (fulfilledCount > 0) {
      AddMemberLogs.membersAddedSuccess(
        this.logger,
        requestingUserId,
        project.id,
        fulfilledCount,
        rejectedCount,
        command.membersId
      )
    } else {
      AddMemberLogs.allMembersAdditionFailed(
        this.logger,
        requestingUserId,
        project.id,
        command.membersId,
        results.map((r: any) => r.reason)
      )
      throw new ConflictException('Failed to add any members to the project.')
    }

    this.event.emit('project', 'add_member', { projectId: project.id })
  }
}