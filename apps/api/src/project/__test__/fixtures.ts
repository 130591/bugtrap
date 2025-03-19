import { testDbClient } from '@testInfra/knex.database'
import { randomUUID } from 'crypto';

export interface TestData {
  hostId: string;
  accountId: string;
  projectId: string;
}

function generateLargeRandomNumber(digits) {
  let number = '';
  for (let i = 0; i < digits; i++) {
    number += Math.floor(Math.random() * 10)
  }
  return number
}

/**
 * Cria os dados necessários para os testes, retornando os IDs gerados.
 */
export const createTestFixtures = async (): Promise<TestData> => {
  const hostId = randomUUID()
  const accountId = randomUUID()
  const projectId = randomUUID()

  await testDbClient('bugtrap.accounts').insert({
		id: accountId,
		account_name: 'Test Account',
		email: `test.account${generateLargeRandomNumber(10)}@example.com`,
		password_hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
	})

	await testDbClient('bugtrap.users').insert({
		id: hostId,
		email: `host@example${generateLargeRandomNumber(10)}.com`,
		first_name: 'Host',
		last_name: 'User',
		password_hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
		account_id: accountId,
	})

  await testDbClient('bugtrap.projects').insert({
    id: projectId,
    project_name: 'Test Project',
    description: 'Projeto de teste para validação',
    owner_id: hostId,
    account_id: accountId,
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
  })
  

  return { hostId, accountId, projectId }
}

/**
 * Remove os dados de teste criados.
 */
export const cleanupTestFixtures = async ({ hostId, accountId, projectId }: TestData) => {
  await testDbClient('project').where({ id: projectId }).del()
  await testDbClient('account').where({ id: accountId }).del()
  await testDbClient('user').where({ id: hostId }).del()
}
