import { Test, TestingModule } from '@nestjs/testing'
import { Reflector } from '@nestjs/core'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { initializeTransactionalContext } from 'typeorm-transactional'
import * as request from 'supertest'
import { CommonResponseInterceptor } from '@src/shared/lib/apicommon'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ProjectRepository } from '@src/project/persist/repository'
import { ProjectModule } from '@src/project/project.module'
import { testDbClient } from '@testInfra/knex.database'
import { Tables } from '@testInfra/tables-enum'
import { EmailBox } from '@src/shared/lib/emailbox'

describe('ProjectController (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let projectRepository: ProjectRepository

  const futureDate = new Date(new Date().setDate(new Date().getDate() + 5)).toISOString()

  beforeAll(async () => {
    initializeTransactionalContext()
    module = await Test.createTestingModule({
      imports: [ProjectModule],
    })
      .overrideProvider(EmailBox)
      .useValue({ sendEmail: jest.fn().mockResolvedValue(true) })
      .compile()
    
    const configService = module.get<ConfigService>(ConfigService)
    const reflector = module.get<Reflector>(Reflector)
    
    app = module.createNestApplication()
    app.useGlobalInterceptors(new CommonResponseInterceptor(configService, reflector))
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    projectRepository = module.get<ProjectRepository>(ProjectRepository)
    await app.init()
  })

  beforeEach(async () => {
    await testDbClient(Tables.Projects).del()
    // jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2025-03-28T09:00:00Z'))
  })

  afterAll(async () => {
    await app.close()
    await module.close()
  })

  it('Should create a project correctly', async () => {
    const actualDate = new Date(new Date().setDate(new Date().getDate() + 1))
    const futureDate = new Date(new Date().setDate(new Date().getDate() + 5))
    
    const projectData = {
      projectName: 'PROJECT-X',
      description: 'NEW PROJECT X',
      accountId: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0',
      ownerId: 'a3b4c5d6-7e8f-9a10-bb11-cd1234abc567',
      tagIds: ['99449rj9jj94r', 'mff03040mfkirmkr3'],
      beginProject: [actualDate, futureDate],
    }

    const response = await request(app.getHttpServer())
      .post('/project')
      .send(projectData)
      .expect(HttpStatus.CREATED)

    expect(response.body).toMatchObject({
      success: true,
      data: expect.objectContaining({
        id: expect.any(String),
        project_name: 'PROJECT-X',
        description: 'NEW PROJECT X',
        startDate: expect.any(String),
        endDate: expect.any(String),
        account_id: expect.any(String),
        owner_id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
      }),
    })

    const savedProject = await projectRepository.find({
      where: { id: response.body.id },
    })

    expect(savedProject).toBeDefined()
    expect(savedProject.project_name).toBe('PROJECT-X')
    expect(savedProject.description).toBe('NEW PROJECT X')
  })

  it('Should list projects with pagination and sorting', async () => {

    const project1 = await projectRepository.persist({
      projectName: 'Project A',
      description: 'Description A',
      accountId: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0',
      ownerId: 'a3b4c5d6-7e8f-9a10-bb11-cd1234abc567',
      beginProject: [futureDate, futureDate],
    })

    await projectRepository.persist({
      projectName: 'Project B',
      description: 'Description B',
      accountId: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0',
      ownerId: 'a3b4c5d6-7e8f-9a10-bb11-cd1234abc567',
      beginProject: [futureDate, futureDate],
    })

    const accountId = project1.account_id
    const response = await request(app.getHttpServer())
      .get(`/project/${accountId}`)
      .query({ page: 1, limit: 2, orderBy: 'createdAt', orderDirection: 'DESC' })
      .expect(HttpStatus.OK)

      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.count).toBeGreaterThanOrEqual(2)
      expect(response.body.pagination.offset).toBe(1)
      expect(response.body.data[0].project_name).toBe('Project B')
      expect(response.body.data[1].project_name).toBe('Project A')
  })

  it('Should return an error when creating a project with invalid data', async () => {
    const invalidProjectData = {
      // accountId: 'f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0',
      ownerId: 'a3b4c5d6-7e8f-9a10-bb11-cd1234abc567',
      // projectName: 'New Project Example',
      description: 'This is an example project for testing.',
      tagIds: [
        'bdbb1234-563f-4df9-9bba-555c4eab0b7b',
        'ccdf4567-78c3-4335-a6b1-c9e89f6d5031'
      ],
      beginProject: [
        '2025-03-28T09:00:00Z',
        '2025-04-01T09:00:00Z'
      ],
    }

    const response = await request(app.getHttpServer())
      .post('/project')
      .send(invalidProjectData)
      .expect(HttpStatus.BAD_REQUEST)

    expect(response.body.status).toBe('error')
    expect(response.body.error).toHaveProperty('code')
    expect(response.body.error.code).toHaveProperty('message')
    expect(response.body.error.code.message).toContain('accountId should not be empty')
    expect(response.body.error.code.message).toContain('accountId must be a UUID')
    expect(response.body.error.code.message).toContain('projectName must be a string')
    expect(response.body.error.code.message).toContain('projectName should not be empty')
    expect(response.body.error.code.statusCode).toBe(400)
    expect(response.body.error.details).toHaveLength(0)
  })

  it('Should return an empty list when no projects are found', async () => {
    const accountId = null
    const response = await request(app.getHttpServer())
      .get(`/project/${accountId}`)
      .query({ page: 1, limit: 10, orderBy: 'createdAt', orderDirection: 'DESC' })
      .expect(HttpStatus.OK)

    expect(response.body.data).toEqual([])
  })
})
