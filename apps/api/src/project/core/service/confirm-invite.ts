import { NotFoundException, Injectable, ConflictException, UseInterceptors } from '@nestjs/common'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { Transactional } from 'typeorm-transactional'
import { InviteEvent } from '@src/shared/event'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ProjectRepository, InvitationRepository } from '@src/project/persist/repository'
import { ExternalIdentityClient } from '@src/project/http/client'
import { ConfirmInviteCommand } from './commands'
import { InvitationStatus } from '../constants'

export interface ConfirmInviteDto {
  status: "pending" | "accepted" | "expired",
  email: string,
  projectId: string
}

@Injectable()
@UseInterceptors(LoggingInterceptor)
export class ConfirmInvitationService {
  constructor(
    private readonly event: BrokerService,
    private readonly publicAPI: ExternalIdentityClient,
    private readonly repository: InvitationRepository,
    private readonly projectRepo: ProjectRepository,
  ) {}

  private async ensureUserExists(email: string) {
    let user = await this.publicAPI.findUserByEmail(email)
    if (!user) {
      user = await this.publicAPI.createUser(email)
    }
    return user
  }

  private async ensureProjectExists(productId: string) {
    let project = await this.projectRepo.findOneById(productId)
    if (!project) {
      throw new NotFoundException('Project not found')
    }
    return project
  }

  private async ensureInviteExists(token: string) {
    let invite = await  this.repository.findInviteByToken(token)
    if (!invite) {
      throw new NotFoundException('Invitation not found')
    }
    return invite
  }

  private ensureNotAlreadyMembers(project, newMember: string) {
    const currentMemberIds = project.members.map(member => member.id)
    const alreadyMembers = currentMemberIds.includes(newMember)
    
    if (alreadyMembers.length > 0) {
      throw new ConflictException('Some users are already members of the project')
    }
  }

  private markAsAccepted(invite: any) {
    if (invite.status != InvitationStatus.PENDING) {
      throw new ConflictException('Invitation has already been used or is invalid.')
    }
    invite.status = InvitationStatus.ACCEPTED
  }

  @Transactional()
  async execute(command: ConfirmInviteCommand): Promise<ConfirmInviteDto> {
    let [invite, user, project] = await Promise.all([
      this.ensureInviteExists(command.token),
      this.ensureUserExists(command.guestEmail),
      this.ensureProjectExists(command.projectId),
    ])
    
    this.ensureNotAlreadyMembers(project, user.id)
    this.markAsAccepted(invite)

    await Promise.allSettled([
      this.projectRepo.addMember(project.id, user.id, invite.role),
      this.repository.confirmInvitation(invite)
    ])

    await this.event.emit('identity', InviteEvent.CONFIRM_INVITATION, { invite, user })
    return { status: invite.status, email: invite.email, projectId: invite.project_id }
  }
}