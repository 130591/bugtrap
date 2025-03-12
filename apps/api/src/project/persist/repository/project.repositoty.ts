import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { ProjectEntity } from '../entities/project.entity'

@Injectable()
export class ProjectRepository extends DefaultTypeOrmRepository<ProjectEntity> {
  constructor(
    private readonly transactionalEntityManager: EntityManager,
  ) {
    super(ProjectEntity, transactionalEntityManager)
  }

  async getQueryBuilder(alias: string) {
    return this.transactionalEntityManager.createQueryBuilder(ProjectEntity, alias)
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
  async persist(command: any) {
    const project = new ProjectEntity({
      description: command.description,
      project_name: command.projectName,
      startDate: command.beginProject[0],
      endDate: command.beginProject[1],
      account_id: command.accountId,
      owner_id: command.ownerId,
    })
  
    return await this.save(project)
  }
}
