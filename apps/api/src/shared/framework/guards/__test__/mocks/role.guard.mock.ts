import { ExecutionContext } from "@nestjs/common"
import { randomUUID } from "node:crypto"

export const createMockContext = (
  userOrgId: string,
  bodyOrgId?: string,
  userPermissions: string[] = [],
  method: string = 'GET',
  userId: string = randomUUID(),
  jti: string = randomUUID(),
) => {
  const requestBody = method !== 'GET' ? { organizationId: bodyOrgId } : {}
  const requestQuery = method === 'GET' ? { organizationId: bodyOrgId } : {}

  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          id: userId,
          organizationId: userOrgId,
          permissions: userPermissions,
          jti: jti, // Adiciona jti ao usuário mockado
        },
        body: requestBody,
        query: requestQuery,
        method: method,
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