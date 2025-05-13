import { TestingModule } from '@nestjs/testing'
import { Reflector } from '@nestjs/core'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { initializeTransactionalContext } from 'typeorm-transactional'
import * as request from 'supertest'
import { CommonResponseInterceptor } from '@src/shared/lib/apicommon'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ProjectModule } from '@src/project/project.module'
import { testDbClient } from '@testInfra/knex.database'
import { Tables } from '@testInfra/tables-enum'
import { createNestApp } from '@testInfra/test-e2e.setup'
import { createTestFixtures, TestData } from '@testInfra/global-fixtures'


describe('ProjectController (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let testData: TestData

  beforeAll(async () => {
    initializeTransactionalContext()
    const nestTestSetup = await createNestApp([ProjectModule])
    app = nestTestSetup.app
    module = nestTestSetup.module
    
    const configService = module.get<ConfigService>(ConfigService)
    const reflector = module.get<Reflector>(Reflector)
    
    app.useGlobalInterceptors(new CommonResponseInterceptor(configService, reflector))
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    testData = await createTestFixtures()
  })

  afterAll(async () => {
    await testDbClient(Tables.Projects).del()
    await testDbClient(Tables.Users).del()
    await testDbClient(Tables.Account).del()
    jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2025-03-28T09:00:00Z'))
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
      accountId: testData.accountId,
      ownerId: testData.hostId,
      tagIds: ['99449rj9jj94r', 'mff03040mfkirmkr3'],
      beginProject: [actualDate, futureDate],
    }

    const response = await request(app.getHttpServer())
      .post('/project')
      .send(projectData)
      .expect(HttpStatus.CREATED)
   
      expect(response.body).toMatchObject({
        id: expect.any(String),
        project_name: expect.any(String),
        description: expect.any(String),
        startDate: expect.any(String),
        endDate: expect.any(String),
        account_id: expect.any(String),
        owner_id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
        status: expect.any(String),
      })
      
      expect(response.body).toBeDefined()
      expect(response.body.project_name).toBe(projectData.projectName)
      expect(response.body.description).toBe(projectData.description)
  })

  it('Should list projects with pagination and sorting', async () => {
    const response = await request(app.getHttpServer())
      .get(`/project/${testData.accountId}`)
      .query({ page: 1, limit: 1, orderBy: 'createdAt', orderDirection: 'DESC' })
      .expect(HttpStatus.OK)
     
      expect(response.body).toHaveLength(1)
      expect(response.body[0].project_name).toBe('PROJECT-X')
      expect(response.body[0].description).toBe('NEW PROJECT X')
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
   
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining([
        'accountId should not be empty',
        'accountId must be a UUID',
        'projectName must be a string',
        'projectName should not be empty',
      ]),
    })
  })

  it('should invite a member successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/project/member')
        .send({
          hostId: testData.hostId,
          guestEmail: 'everton.paixao16@gmail.com',
          accountId: testData.accountId,
          projectId: testData.projectId,
          permissions: ['member'],
        })
        
      expect(response.body).toHaveProperty('id')
      expect(response.body.email).toBe('everton.paixao16@gmail.com')
    })

    it('should return 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post('/project/member')
        .send({ email: '', projectId: '', role: '' })
        .expect(400)
    })

  it('Should return an empty list when no projects are found', async () => {
    const accountId = null
    const response = await request(app.getHttpServer())
      .get(`/project/accountId`)
      .query({ page: 1, limit: 10, orderBy: 'createdAt', orderDirection: 'DESC' })
      .expect(HttpStatus.OK)

    expect(response.body).toEqual([])
  })
})
