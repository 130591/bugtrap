import knex from 'knex'

export const testDbClient = knex({
  client: 'pg',
  connection: process.env.DB_URL,
  searchPath: ['bugtrap'],
  pool: { min: 2, max: 5 },
})
