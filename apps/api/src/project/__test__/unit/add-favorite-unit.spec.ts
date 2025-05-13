import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common'
import { ForbiddenStatus, ProjectStatus } from '@src/project/core/constants'
import { AddFavoriteService } from '@src/project/core/service/add-favorite'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'
import { FavoriteRepository, ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { randomUUID } from 'crypto'

describe('AddFavoriteService (Unit)', () => {
  let service: AddFavoriteService
  let projectRepo: jest.Mocked<ProjectRepository>
  let favoriteRepo: jest.Mocked<FavoriteRepository>
  let brokerService: jest.Mocked<BrokerService>

  const userId = randomUUID()
  const projectId = randomUUID()

  beforeEach(() => {
    projectRepo = { find: jest.fn() } as any
    favoriteRepo = { persist: jest.fn() } as any
    brokerService = { emit: jest.fn() } as any

    service = new AddFavoriteService(brokerService, projectRepo, favoriteRepo)
  })

  it('should add a favorite successfully', async () => {
    const project: ProjectEntity = {
      id: projectId,
      status: ProjectStatus.ACTIVE,
      owner_id: userId,
      members: [],
      favorites: [],
    } as any

    projectRepo.find.mockResolvedValue(project)

    await service.execute({
      projectId,
      userId,
      accountId: 'acc-1',
      note: 'Nice project!',
      context: 'dashboard',
    })

    expect(favoriteRepo.persist).toHaveBeenCalledWith(expect.objectContaining({ projectId, userId }))
    expect(brokerService.emit).toHaveBeenCalledWith('project', 'add.favorite', { projectId })
  })

  it('should throw NotFoundException when project not found', async () => {
    projectRepo.find.mockResolvedValue(null)

    await expect(service.execute({
      projectId,
      userId,
      accountId: 'acc-1',
      note: '',
      context: '',
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw ForbiddenException for finalized project', async () => {
    const project = {
      id: projectId,
      status: ForbiddenStatus[0],
      owner_id: userId,
      members: [],
      favorites: [],
    } as any

    projectRepo.find.mockResolvedValue(project)

    await expect(service.execute({
      projectId,
      userId,
      accountId: 'acc-1',
      note: '',
      context: '',
    })).rejects.toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException if user is not a member or owner', async () => {
    const project = {
      id: projectId,
      status: 'ACTIVE',
      owner_id: 'other-user',
      members: [],
      favorites: [],
    } as any

    projectRepo.find.mockResolvedValue(project)

    await expect(service.execute({
      projectId,
      userId,
      accountId: 'acc-1',
      note: '',
      context: '',
    })).rejects.toThrow(ForbiddenException)
  })

  it('should throw ConflictException if already favorited', async () => {
    const project = {
      id: projectId,
      status: 'ACTIVE',
      owner_id: userId,
      members: [],
      favorites: [{ userId }],
    } as any

    projectRepo.find.mockResolvedValue(project)

    await expect(service.execute({
      projectId,
      userId,
      accountId: 'acc-1',
      note: '',
      context: '',
    })).rejects.toThrow(ConflictException)
  })

  it('should throw ForbiddenException if max favorites reached', async () => {
    const favorites = Array(20).fill({ userId })
    const project = {
      id: projectId,
      status: 'ACTIVE',
      owner_id: userId,
      members: [],
      favorites,
    } as any

    projectRepo.find.mockResolvedValue(project)

    await expect(service.execute({
      projectId,
      userId,
      accountId: 'acc-1',
      note: '',
      context: '',
    })).rejects.toThrow(ForbiddenException)
  })
})
