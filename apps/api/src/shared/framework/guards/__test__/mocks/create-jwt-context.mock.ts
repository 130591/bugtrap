import { ExecutionContext } from '@nestjs/common'

export const createMockContext = (userOrgId: string, bodyOrgId?: string) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { organizationId: userOrgId },
          body: { organizationId: bodyOrgId },
        }),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getType: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext
  }