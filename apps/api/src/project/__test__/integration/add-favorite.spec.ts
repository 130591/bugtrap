import { ForbiddenException, INestApplication } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Test } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { randomUUID } from 'crypto'
import { ProjectModule } from '@src/project/project.module'
import { AddFavoriteService } from '@src/project/core/service/add-favorite'
import { FavoriteRepository, ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'
import { ProjectStatus } from '@src/project/core/constants'

describe('AddFavoriteService (integration)', () => {
  let app: INestApplication
  let service: AddFavoriteService
  let projectRepo: ProjectRepository
  let favoriteRepo: FavoriteRepository
  let dataSource: DataSource

	const userId = randomUUID()
	const accountId = randomUUID()

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        ProjectModule,
      ],
    })
      .overrideProvider(BrokerService)
      .useValue({ emit: jest.fn() })
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()

    service = moduleRef.get(AddFavoriteService)
    projectRepo = moduleRef.get(ProjectRepository)
    favoriteRepo = moduleRef.get(FavoriteRepository)
    dataSource = moduleRef.get(DataSource)
  })

  afterEach(async () => {
    const entities = dataSource.entityMetadatas

    for (const entity of entities) {
      const repo = dataSource.getRepository(entity.name)
      await repo.clear()
    }
  })

  afterAll(async () => {
    await app.close()
  })

  it('must favorite a successful project', async () => {
    const project = await projectRepo.save(new ProjectEntity({
      id: randomUUID(),
      status: ProjectStatus.ACTIVE,
      owner_id: userId,
      members: [],
      favorites: [],
    }))
		
    await service.execute({
      projectId: project.id,
      userId: userId,
      accountId: accountId,
      note: 'Favorito via integração',
      context: 'dashboard',
    })

    const favs = await favoriteRepo.findMany({ where: { projectId: project.id } })
    expect(favs).toHaveLength(1)
    expect(favs[0].userId).toBe('user-1')
  })

	it('should throw ForbiddenException if user is not a member or owner', async () => {
		const ownerId = randomUUID()
		const unauthorizedUserId = randomUUID()
	
		const project = await projectRepo.save(new ProjectEntity({
			id: randomUUID(),
			status: ProjectStatus.ACTIVE,
			owner_id: ownerId,
			members: [],
			favorites: [],
		}))
	
		await expect(service.execute({
			projectId: project.id,
			userId: unauthorizedUserId,
			accountId: 'acc-1',
			note: 'Tentativa de favorito',
			context: 'dashboard',
		})).rejects.toThrow(ForbiddenException)
  })
})
