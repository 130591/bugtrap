import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { ProjectEntity } from '../entities/project.entity'
import { CreateProjectCommand } from '../../core/contract/command.contract'


@Injectable()
export class ProjectRepository extends DefaultTypeOrmRepository<ProjectEntity> {
  constructor(
    @InjectDataSource('project')
    private readonly dataSource: DataSource
  ) {
    super(ProjectEntity, dataSource.manager)
  }

  async getQueryBuilder(alias: string) {
    return this.dataSource.createQueryBuilder(ProjectEntity, alias)
      .leftJoinAndSelect(`${alias}.members`, 'members')
      .leftJoinAndSelect(`${alias}.invitations`, 'invitations')
  }

  async countActiveProjectsForOwner(id: any) {
    try {
      const projects = await this.findMany({
        relationLoadStrategy: 'join',
        where: {
          owner_id: id
        }
      })

      return projects.length
    } catch (error) {
      console.log('errp', error)
    }
	}

  async addMember(projectId: string, user: any, role: string): Promise<ProjectEntity> {
    const project = await this.find({ where: { id: projectId }, relations: ['members'] });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.members.some(member => member.id === user.id)
    if (isMember) {
      throw new ConflictException('User is already a member of this project')
    }

    project.members.push({ ...user, role })
    return await this.save(project)
  }

  async countProjectsByAccountId(accountId: string) {
    try {
      const totalProjects = await this.repository.count({
        where: {
          account_id: accountId,
        },
      })
      return totalProjects
    } catch (error) {
      console.log('Error counting projects by account_id:', error)
      throw error
    }
  }

  @Transactional()
  async persist(command: CreateProjectCommand) {
    const project = new ProjectEntity({
      description: command.description,
      project_name: command.projectName,
      startDate: new Date(command.beginProject[0]),
      endDate: new Date(command.beginProject[1]),
      account_id: command.accountId,
      owner_id: command.ownerId,
    })
  
    return await this.save(project)
  }
}
