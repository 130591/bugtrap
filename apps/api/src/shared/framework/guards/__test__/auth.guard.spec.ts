import { Test } from '@nestjs/testing'
import { JwtAuthGuard } from '../auth.guard'
import { ForbiddenException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { createMockContext } from './mocks/create-jwt-context.mock'

const mockAuthGuard = {
  canActivate: jest.fn(),
}

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation((type) => {
    return class {
      canActivate = mockAuthGuard.canActivate
    }
  }),
}))

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let mockedAuthGuardCanActivate: jest.Mock

  beforeEach(async () => {
    mockAuthGuard.canActivate.mockClear()
    mockAuthGuard.canActivate.mockReturnValue(true)

    const moduleRef = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile()

    guard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard)
    mockedAuthGuardCanActivate = mockAuthGuard.canActivate
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    it('should allow access if body.organizationId matches user.organizationId', async () => {
      const orgId = randomUUID()
      const context = createMockContext(orgId, orgId)

      const result = await guard.canActivate(context)

      expect(mockedAuthGuardCanActivate).toHaveBeenCalledWith(context)
      expect(result).toBe(true)
    })

    it('should throw ForbiddenException if body.organizationId is missing', async () => {
      const userOrgId = randomUUID()
      const context = createMockContext(userOrgId, undefined)

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('You do not have permission to perform this operation.')
      expect(mockedAuthGuardCanActivate).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException if body.organizationId does not match user.organizationId', async () => {
      const userOrgId = randomUUID()
      const bodyOrgId = randomUUID()
      const context = createMockContext(userOrgId, bodyOrgId)

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('You do not have permission to perform this operation.')
      expect(mockedAuthGuardCanActivate).not.toHaveBeenCalled()
    })
  })
})
