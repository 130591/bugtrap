import { Injectable, UseInterceptors } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { LoggerService } from '@src/shared/lib/logger'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { ProjectRepository } from '@src/project/persist/repository'
import { EventPublisher } from '@src/shared/framework/events/event-publisher.service'
import { ExternalIdentityClient } from '@src/project/http/client'
import { 
  FailedToAddMembersException, 
  ProjectNotFoundException, 
  UsersNotFoundException 
} from '../exception'
import { AddMemberLogs } from './logger'
import { Membership } from './policies'
import { InputAddMember } from './commands'
import { MemberAddedEvent } from '../events/member-added.event'


@Injectable()
@UseInterceptors(LoggingInterceptor)
export class AddMemberService {
  constructor(
    private readonly logger: LoggerService,
    private readonly eventPublisher: EventPublisher,
    private readonly projectRepository: ProjectRepository,
    private readonly publicAPI: ExternalIdentityClient,
  ) {}

  private async ensureAllUsersExist(membersId: string[]): Promise<any[]> {
    const users = await Promise.all(membersId.map(id => this.publicAPI.findUserById(id)))
    
    if (users.some(user => !user)) {      
      throw new UsersNotFoundException()
    }
    return users
  }

  @Transactional()
  async execute(command: InputAddMember): Promise<void> {
    const requestingUserId = command.projectId || 'unknown_user'

    const [_, project] = await Promise.all([
      this.ensureAllUsersExist(command.membersId),
      this.projectRepository.getProjectAndMembers(command.projectId)
    ])

    if (!project) throw new ProjectNotFoundException(project.id)
    
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

      // Publish domain event for successful member additions
      const event = new MemberAddedEvent(
        project.id,
        command.membersId,
        requestingUserId,
        fulfilledCount,
        rejectedCount
      )
      await this.eventPublisher.publish(event)
    } else {
      AddMemberLogs.allMembersAdditionFailed(
        this.logger,
        requestingUserId,
        project.id,
        command.membersId,
        results.map((r: any) => r.reason)
      )
      throw new FailedToAddMembersException()
    }
  }
}