-- Garante que o banco de dados 'bugtrap' existe e conecta-se a ele
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'bugtrap') THEN
        CREATE DATABASE bugtrap;
    END IF;
END $$;

\c bugtrap;

SET search_path TO "$user", public, bugtrap;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para os status do usuário
CREATE TYPE bugtrap.user_status AS ENUM ('pending', 'active', 'suspended', 'deactivated');
-- Enum para os roles dentro de uma organização/projeto
CREATE TYPE bugtrap.member_role AS ENUM ('owner', 'admin', 'member', 'viewer', 'contributor');
-- Enum para o tipo de organização (se necessário diferenciar)
CREATE TYPE bugtrap.organization_type AS ENUM ('community', 'project', 'company', 'personal');


-- Tabela de Usuários (centraliza o perfil do usuário)
-- SUBSTITUI 'bugtrap.accounts' e 'bugtrap.users' numa só
CREATE TABLE bugtrap.users (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash CHAR(64), -- Nullable se usar apenas OAuth (e.g., GitHub)
    github_id VARCHAR(255) UNIQUE, -- ID do GitHub para autenticação OAuth
    github_username VARCHAR(255) UNIQUE, -- Username do GitHub
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    display_name VARCHAR(100), -- Nome exibido, pode ser firstName + lastName ou username GitHub
    portrait_image_url TEXT, -- URL para a imagem do perfil (avatar), pode ser do GitHub
    bio TEXT, -- Breve biografia
    status bugtrap.user_status NOT NULL DEFAULT 'pending',
    activation_token VARCHAR(255), -- Para registro por email/senha
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);




-- Tabela de Organizações
-- Nova entidade para agrupar projetos e usuários
CREATE TABLE bugtrap.organizations (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE, -- Para URLs amigáveis (e.g., opendevflow.com/orgs/minha-org)
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    type bugtrap.organization_type NOT NULL DEFAULT 'community',
    created_by UUID NOT NULL, -- O usuário que criou a organização
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT organizations_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES bugtrap.users(id) ON DELETE RESTRICT
);

-- Tabela de Membros da Organização (Associação N:M entre Usuários e Organizações)
CREATE TABLE bugtrap.organization_members (
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role bugtrap.member_role NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT organization_members_pkey PRIMARY KEY (organization_id, user_id), -- Chave primária composta
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES bugtrap.organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE CASCADE
);

-- Tabela de Projetos (pode pertencer a uma Organização ou ser independente)
-- Mantém a essência de 'bugtrap.projects' mas com novas relações
CREATE TABLE bugtrap.projects (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE, -- Opcional, para URLs amigáveis do projeto
    description TEXT,
    github_repo_url TEXT UNIQUE, -- URL do repositório GitHub associado
    organization_id UUID, -- Chave estrangeira para a organização (NULL se for um projeto independente)
    owner_id UUID NOT NULL, -- O usuário que criou/é o owner principal do projeto
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- Status do projeto (active, archived, etc.)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT projects_pkey PRIMARY KEY (id),
    CONSTRAINT fk_organization_project FOREIGN KEY (organization_id) REFERENCES bugtrap.organizations(id) ON DELETE SET NULL, -- Se a organização for deletada, o projeto pode se tornar independente
    CONSTRAINT fk_project_owner FOREIGN KEY (owner_id) REFERENCES bugtrap.users(id) ON DELETE RESTRICT
);

-- Tabela de Membros do Projeto (Associação N:M entre Usuários e Projetos)
-- Permite que usuários sejam membros de projetos diretamente, sem necessidade de pertencerem à mesma organização
-- SUBSITUI 'bugtrap.project_members' com a nova lógica
CREATE TABLE bugtrap.project_members (
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role bugtrap.member_role NOT NULL DEFAULT 'contributor', -- admin, member, viewer, contributor
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT project_members_pkey PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project_member FOREIGN KEY (project_id) REFERENCES bugtrap.projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_project FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE CASCADE
);

-- Tabela para gerenciar habilidades/interesses dos usuários
CREATE TABLE bugtrap.user_skills (
    user_id UUID NOT NULL,
    skill_name VARCHAR(50) NOT NULL,
    CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_name),
    CONSTRAINT fk_user_skill FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE CASCADE
);

-- Tabela de Convites (para Organizações e Projetos)
-- SUBSITUI 'bugtrap.invitations'
CREATE TABLE bugtrap.invitations (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    email TEXT, -- Opcional se for um convite interno para um usuário existente
    invited_user_id UUID, -- ID do usuário convidado (se já registrado na plataforma)
    organization_id UUID,
    project_id UUID, -- Convite pode ser para org OU projeto
    role bugtrap.member_role NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, revoked
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    invited_by_user_id UUID, -- Quem enviou o convite
    CONSTRAINT invitations_pkey PRIMARY KEY (id),
    CONSTRAINT invitations_org_proj_check CHECK (
        (organization_id IS NOT NULL AND project_id IS NULL) OR
        (organization_id IS NULL AND project_id IS NOT NULL)
    ), -- Convite é para Org OU Projeto, não ambos
    CONSTRAINT fk_invited_user FOREIGN KEY (invited_user_id) REFERENCES bugtrap.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_invitation_org FOREIGN KEY (organization_id) REFERENCES bugtrap.organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitation_project FOREIGN KEY (project_id) REFERENCES bugtrap.projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_invited_by_user FOREIGN KEY (invited_by_user_id) REFERENCES bugtrap.users(id) ON DELETE SET NULL
);

ALTER TABLE invitations ADD CONSTRAINT unique_pending_invite 
  UNIQUE (project_id, guest_email) WHERE status = 'pending';

-- Tabela para Bugs (Issues) - Mantida com ajustes de chaves estrangeiras
-- Adaptação de 'bugtrap.bugs'
CREATE TABLE bugtrap.issues (
    id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Usar UUID para consistência
    project_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL, -- Summary virou title
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- Pode ser um ENUM no futuro
    priority VARCHAR(50), -- Pode ser um ENUM no futuro
    type VARCHAR(50), -- Bug, Feature, Improvement, etc.
    reported_by UUID NOT NULL,
    assigned_to UUID,
    verified_by UUID,
    date_reported TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    date_resolved TIMESTAMP WITH TIME ZONE,
    hours_spent NUMERIC(9, 2), -- 'hours' virou 'hours_spent'
    github_issue_id VARCHAR(255), -- ID da issue no GitHub (para sincronização)
    github_issue_url TEXT, -- URL da issue no GitHub
    CONSTRAINT issues_pkey PRIMARY KEY (id),
    CONSTRAINT fk_issue_project FOREIGN KEY (project_id) REFERENCES bugtrap.projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_reported_by_user FOREIGN KEY (reported_by) REFERENCES bugtrap.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assigned_to_user FOREIGN KEY (assigned_to) REFERENCES bugtrap.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_verified_by_user FOREIGN KEY (verified_by) REFERENCES bugtrap.users(id) ON DELETE SET NULL
);

-- Tabela de Comentários em Issues
CREATE TABLE bugtrap.issue_comments (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT issue_comments_pkey PRIMARY KEY (id),
    CONSTRAINT fk_comment_issue FOREIGN KEY (issue_id) REFERENCES bugtrap.issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE CASCADE
);

-- Tabela de Anexos/Screenshots (associada às Issues)
-- Adaptação de 'bugtrap.screenshots'
CREATE TABLE bugtrap.attachments (
    id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Novo PK para flexibilidade
    issue_id UUID NOT NULL,
    uploaded_by UUID NOT NULL,
    file_url TEXT NOT NULL, -- URL onde o arquivo está armazenado (e.g., S3)
    file_name VARCHAR(255),
    file_type VARCHAR(50), -- image/jpeg, application/pdf
    caption VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT attachments_pkey PRIMARY KEY (id),
    CONSTRAINT fk_attachment_issue FOREIGN KEY (issue_id) REFERENCES bugtrap.issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_uploaded_by_user FOREIGN KEY (uploaded_by) REFERENCES bugtrap.users(id) ON DELETE RESTRICT
);

-- Tabela de Tags para Issues (para categorização flexível)
CREATE TABLE bugtrap.issue_tags (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL, -- Tags são específicas do projeto
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7), -- Código HEX da cor da tag
    CONSTRAINT issue_tags_pkey PRIMARY KEY (id),
    CONSTRAINT issue_tags_project_id_name_key UNIQUE (project_id, name),
    CONSTRAINT fk_tag_project FOREIGN KEY (project_id) REFERENCES bugtrap.projects(id) ON DELETE CASCADE
);

-- Tabela de associação N:M entre Issues e Tags
CREATE TABLE bugtrap.issue_has_tags (
    issue_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    CONSTRAINT issue_has_tags_pkey PRIMARY KEY (issue_id, tag_id),
    CONSTRAINT fk_issue_tag_issue FOREIGN KEY (issue_id) REFERENCES bugtrap.issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_issue_tag_tag FOREIGN KEY (tag_id) REFERENCES bugtrap.issue_tags(id) ON DELETE CASCADE
);

-- Tabela para manter o histórico de alterações das issues (Auditoria)
CREATE TABLE bugtrap.issue_history (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Quem fez a alteração
    change_type VARCHAR(50) NOT NULL, -- e.g., 'status_change', 'assignment_change', 'description_update'
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT issue_history_pkey PRIMARY KEY (id),
    CONSTRAINT fk_history_issue FOREIGN KEY (issue_id) REFERENCES bugtrap.issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE RESTRICT
);

-- Tabela para armazenar as credenciais OAuth de usuários (ex: GitHub)
CREATE TABLE bugtrap.oauth_accounts (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'github', 'google', etc.
    provider_user_id VARCHAR(255) NOT NULL, -- ID do usuário no provedor OAuth
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT oauth_accounts_user_provider_key UNIQUE (user_id, provider),
    CONSTRAINT oauth_accounts_provider_user_id_key UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE CASCADE
);


-- Índices para otimização
CREATE INDEX idx_users_email ON bugtrap.users (email);
CREATE INDEX idx_users_github_id ON bugtrap.users (github_id);
CREATE INDEX idx_organizations_slug ON bugtrap.organizations (slug);
CREATE INDEX idx_projects_organization_id ON bugtrap.projects (organization_id);
CREATE INDEX idx_projects_owner_id ON bugtrap.projects (owner_id);
CREATE INDEX idx_issues_project_id ON bugtrap.issues (project_id);
CREATE INDEX idx_issues_assigned_to ON bugtrap.issues (assigned_to);
CREATE INDEX idx_invitations_token ON bugtrap.invitations (token);
CREATE INDEX idx_invitations_email ON bugtrap.invitations (email);

-- Triggers para 'updated_at' (opcional, mas boa prática)
-- Exemplo para a tabela 'users'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON bugtrap.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();




ALTER TABLE projects
ADD COLUMN search_vector TSVECTOR;

-- 2. Criar um índice GIN na coluna search_vector
--    Este índice é essencial para que as buscas sejam rápidas
CREATE INDEX projects_search_vector_idx
ON projects
USING GIN (search_vector);

-- 3. Criar uma função para atualizar o search_vector
--    Esta função será usada pelos gatilhos para popular e atualizar a coluna
--    Aqui, estamos usando 'english' como configuração de dicionário de texto completo.
--    Você pode ajustar as colunas que deseja indexar (project_name, description, tags, etc.)
CREATE OR REPLACE FUNCTION update_projects_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english',
        COALESCE(NEW.project_name, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '') -- Converte o array de tags para string
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar gatilhos (triggers) para chamar a função automaticamente
--    O gatilho AFTER INSERT e AFTER UPDATE garantirá que o search_vector
--    seja atualizado sempre que um projeto for inserido ou modificado.
CREATE TRIGGER projects_search_vector_update
BEFORE INSERT OR UPDATE OF project_name, description, tags -- Liste as colunas que, ao serem alteradas, devem atualizar o search_vector
ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_search_vector();

-- 5. Opcional: Popular a coluna search_vector para dados já existentes
--    Se você já tem dados na tabela 'projects', execute este comando
--    para preencher a coluna 'search_vector' para esses registros existentes.
-- UPDATE projects
-- SET search_vector = to_tsvector('english',
--     COALESCE(project_name, '') || ' ' ||
--     COALESCE(description, '') || ' ' ||
--     COALESCE(array_to_string(tags, ' '), '')
-- );