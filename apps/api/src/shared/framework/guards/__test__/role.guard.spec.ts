import { Reflector } from "@nestjs/core"
import { RoleGuard } from "../role.guard"
import { CacheService } from "@src/shared/module/cache"
import { Test } from "@nestjs/testing"
import { JwtAuthGuard } from "../auth.guard"
import { createMockContext } from "./mocks/role.guard.mock"
import { randomUUID } from "node:crypto"
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"

const mockCacheService = {
  userHasAccess: jest.fn(),
  isTokenRevoked: jest.fn(),
}

const mockReflector = {
  get: jest.fn(),
}


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

const ROLES_KEY = 'roles'

jest.mock('class-validator', () => ({
  isUUID: jest.fn((value: string) => typeof value === 'string' && value.length === 36),
}))

const { isUUID } = require('class-validator')

describe('RoleGuard', () => {
  let guard: RoleGuard
  let reflector: Reflector
  let cacheService: CacheService

  beforeEach(async () => {

    mockAuthGuard.canActivate.mockClear()
    mockReflector.get.mockClear()
    mockCacheService.userHasAccess.mockClear()
    mockCacheService.isTokenRevoked.mockClear()
    isUUID.mockClear()

    mockAuthGuard.canActivate.mockResolvedValue(true)
    mockReflector.get.mockReturnValue(undefined)
    mockCacheService.userHasAccess.mockResolvedValue(true)
    mockCacheService.isTokenRevoked.mockResolvedValue(false)
    isUUID.mockReturnValue(true)


    const moduleRef = await Test.createTestingModule({
      providers: [
        RoleGuard,
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile()

    guard = moduleRef.get<RoleGuard>(RoleGuard)
    reflector = moduleRef.get<Reflector>(Reflector)
    cacheService = moduleRef.get<CacheService>(CacheService)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    it('should return false if JwtAuthGuard (super.canActivate) returns false', async () => {
      mockAuthGuard.canActivate.mockResolvedValue(false)
      const context = createMockContext(randomUUID(), randomUUID(), ['admin'])

      const result = await guard.canActivate(context)

      expect(result).toBe(false)
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
    })

    it('should return true if no roles are required (no @Roles decorator)', async () => {
      mockReflector.get.mockReturnValue(undefined)
      const context = createMockContext(randomUUID(), randomUUID())

      const result = await guard.canActivate(context)

      expect(result).toBe(true)
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(reflector.get).toHaveBeenCalledTimes(1)
    })

    it('should throw UnauthorizedException if user is not authenticated (user object missing)', async () => {
      const context = createMockContext(randomUUID(), randomUUID(), ['admin'], 'GET', undefined)
      mockReflector.get.mockReturnValue(['admin'])

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
      await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(reflector.get).toHaveBeenCalledTimes(1)
    })

     it('should throw UnauthorizedException if user.id is missing', async () => {
      const context = createMockContext(randomUUID(), randomUUID(), ['admin'], 'GET', null)
      mockReflector.get.mockReturnValue(['admin'])

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
      await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
    })
  })

   it('should throw ForbiddenException if organizationId is missing', async () => {
      const userOrgId = randomUUID()
      isUUID.mockReturnValue(false)
      const context = createMockContext(userOrgId, 'invalid-uuid', ['admin'])
      mockReflector.get.mockReturnValue(['admin'])

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('You do not have permission to perform this operation.')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(isUUID).toHaveBeenCalledWith('invalid-uuid')
    })

    it('should throw ForbiddenException if organizationId is not a valid UUID', async () => {
      const userOrgId = randomUUID()
      isUUID.mockReturnValue(false)
      const context = createMockContext(userOrgId, 'not-a-uuid', ['admin'])
      mockReflector.get.mockReturnValue(['admin'])

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('You do not have permission to perform this operation.')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(isUUID).toHaveBeenCalledWith('not-a-uuid')
    })

    it('should throw ForbiddenException if user has no access to the account (cache.userHasAccess returns false)', async () => {
      mockCacheService.userHasAccess.mockResolvedValue(false)
      mockReflector.get.mockReturnValue(['admin'])
      const context = createMockContext(randomUUID(), randomUUID(), ['admin'])

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('User without permission on this account')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(cacheService.userHasAccess).toHaveBeenCalledTimes(1)
    })

    it('should throw UnauthorizedException if token is revoked (cache.isTokenRevoked returns true)', async () => {
      mockCacheService.isTokenRevoked.mockResolvedValue(true)
      mockReflector.get.mockReturnValue(['admin'])
      const context = createMockContext(randomUUID(), randomUUID(), ['admin'])

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
      await expect(guard.canActivate(context)).rejects.toThrow('Expired or revoked token')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(cacheService.isTokenRevoked).toHaveBeenCalledTimes(1)
    })

    it('should throw ForbiddenException if user permissions are not defined or empty', async () => {
      let context = createMockContext(randomUUID(), randomUUID(), undefined)
      mockReflector.get.mockReturnValue(['admin'])
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('Permissions not defined for the user')

      context = createMockContext(randomUUID(), randomUUID(), [])
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('Permissions not defined for the user')
    })

    it('should throw ForbiddenException if user does not have the required role', async () => {
      mockReflector.get.mockReturnValue(['admin'])
      const context = createMockContext(randomUUID(), randomUUID(), ['user'])

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      await expect(guard.canActivate(context)).rejects.toThrow('User not allowed for this operation')
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
    })

    it('should allow access if user has the required role', async () => {
      mockReflector.get.mockReturnValue(['admin'])
      const context = createMockContext(randomUUID(), randomUUID(), ['user', 'admin'])

      const result = await guard.canActivate(context)

      expect(result).toBe(true)
      expect(mockAuthGuard.canActivate).toHaveBeenCalledTimes(1)
      expect(cacheService.userHasAccess).toHaveBeenCalledTimes(1)
      expect(cacheService.isTokenRevoked).toHaveBeenCalledTimes(1)
    })

    it('should set body.organizationId for POST/PATCH/DELETE requests', async () => {
      const orgId = randomUUID()
      const context = createMockContext(orgId, undefined, ['admin'], 'POST')
      mockReflector.get.mockReturnValue(['admin'])
      context.switchToHttp().getRequest().body = {} 

      await guard.canActivate(context)

      expect(context.switchToHttp().getRequest().body.organizationId).toBe(orgId)

      const patchContext = createMockContext(orgId, undefined, ['admin'], 'PATCH')
      patchContext.switchToHttp().getRequest().body = {}
      await guard.canActivate(patchContext)
      expect(patchContext.switchToHttp().getRequest().body.organizationId).toBe(orgId)

      const deleteContext = createMockContext(orgId, undefined, ['admin'], 'DELETE')
      deleteContext.switchToHttp().getRequest().body = {}
      await guard.canActivate(deleteContext)
      expect(deleteContext.switchToHttp().getRequest().body.organizationId).toBe(orgId)
    })

    it('should set query.organizationId for GET requests', async () => {
      const orgId = randomUUID()
      const context = createMockContext(orgId, undefined, ['admin'], 'GET')
      mockReflector.get.mockReturnValue(['admin'])
      context.switchToHttp().getRequest().query = {}

      await guard.canActivate(context)

      expect(context.switchToHttp().getRequest().query.organizationId).toBe(orgId)
    })
})