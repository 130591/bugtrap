import { Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ExternalIdentityClient } from '@src/project/http/client'
import { Membership } from './policies'
import { InputAddMember } from './commands'

@Injectable()
export class AddMemberService {
  constructor(
    private readonly event: BrokerService,
    private readonly repository: ProjectRepository,
    private readonly publicAPI: ExternalIdentityClient,
  ) {}

  private async ensureAllUsersExist(membersId: string[]) {
    // this method(findUserById) needs to be reviewed, a real implementation is not available, only in memory.
    const users = await Promise.all(membersId.map(id => this.publicAPI.findUserById(id)))
    if (users.some(user => !user)) {
      throw new NotFoundException('One or more users not found')
    }

    return users
  }

  @Transactional()
  async execute(command: InputAddMember): Promise<void> {
    let [_, project] = await Promise.all([
			this.ensureAllUsersExist(command.membersId),
			this.repository.find({
        where: { id: command.projectId },
        relations: ['members'],
      })
    ])

    if (!project) throw new NotFoundException('Project not found')
    
    const currentMemberIds = project.members.map(member => member.id)
    Membership.checkPolicies(project.status, currentMemberIds, command.membersId)
    
    await Promise.all(
      command.membersId.map(memberId =>
        this.repository.addMember(command.projectId, memberId, 'member')
      )
    )
    this.event.emit('project', 'add_member', { projectId: project.id })
  }
}
