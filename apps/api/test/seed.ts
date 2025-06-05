import { testDbClient } from './knex.database';
import { randomUUID } from 'crypto';

// Função para inserir dados no banco
async function seedDatabase() {
  try {
    console.log('Inserindo dados no banco...');

    // Criando uma conta
    const [account] = await testDbClient('bugtrap.accounts')
      .insert({
        id: randomUUID(),
        account_name: 'TechCorp',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@techcorp.com',
        password_hash: 'a'.repeat(64), // Simulação de hash
        status: 'active',
      })
      .returning('*');

    console.log('Conta criada:', account);

    // Criando um usuário
    const [user] = await testDbClient('bugtrap.users')
      .insert({
        id: randomUUID(),
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice.smith@techcorp.com',
        password_hash: 'b'.repeat(64),
        account_id: account.id,
      })
      .returning('*');

    console.log('Usuário criado:', user);

    // Criando um projeto
    const [project] = await testDbClient('bugtrap.projects')
      .insert({
        id: randomUUID(),
        project_name: 'BugTracker v1',
        description: 'Sistema para rastreamento de bugs',
        owner_id: user.id,
        account_id: account.id,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 meses depois
        status: 'active',
      })
      .returning('*');

    console.log('Projeto criado:', project);

    // Criando um bug
    const [bug] = await testDbClient('bugtrap.bugs')
      .insert({
        date_reported: new Date(),
        summary: 'Erro na tela de login',
        description: 'Usuários não conseguem fazer login ao usar um e-mail com caracteres especiais.',
        resolution: null,
        reported_by: user.id,
        assigned_to: null,
        verified_by: null,
        status: 'NEW',
        priority: 'HIGH',
      })
      .returning('*');

    console.log('Bug registrado:', bug);

    console.log('Seeding finalizado com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  } finally {
    await testDbClient.destroy();
  }
}

// Executando o seed
seedDatabase();
