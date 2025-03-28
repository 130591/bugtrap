import { NotFoundException, Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { InviteEvent } from '@src/shared/event'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ConfirmInviteCommand } from '../contract/command.contract'
import { ProjectRepository, InvitationRepository } from '@src/project/persist/repository'
import { ExternalIdentityClient } from '@src/project/http/client'


@Injectable()
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

  @Transactional()
  async execute(command: ConfirmInviteCommand) {
    const invite = await this.repository.findInviteByToken(command.token)
    if (!invite) throw new NotFoundException('Invitation not found')
    
    const user = await this.ensureUserExists(command.guestEmail)
    const project = await this.projectRepo.findOneById(invite.project_id)

    if (!project) throw new NotFoundException('Project not found')
    await this.projectRepo.addMember(project.id, user.id, invite.role)
		
    invite.status = 'accepted'
    await this.repository.confirmInvitation(invite)
    
    await this.event.emit('identity', InviteEvent.CONFIRM_INVITATION, { invite, user })
    return { accepted: invite.status, email: invite.email, projectId: invite.project_id }
  }
}