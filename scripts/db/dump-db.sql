DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'bugtrap') THEN
        CREATE DATABASE bugtrap;
    END IF;
END $$;

\c bugtrap;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- bugtrap.accounts definition

-- Drop table

-- DROP TABLE bugtrap.accounts;

CREATE TABLE bugtrap.accounts (
	id uuid NOT NULL DEFAULT bugtrap.uuid_generate_v4(),
	account_name varchar(20) NULL,
	first_name varchar(20) NULL,
	last_name varchar(20) NULL,
	email varchar(100) NULL,
	password_hash bpchar(64) NULL,
	portrait_image bytea NULL,
	hourly_rate numeric(9, 2) NULL,
	status bugtrap."account_status" NULL DEFAULT 'pending'::bugtrap.account_status,
	activation_token varchar(255) NULL,
	CONSTRAINT accounts_pkey PRIMARY KEY (id)
);


-- bugtrap.bugs definition

-- Drop table

-- DROP TABLE bugtrap.bugs;

CREATE TABLE bugtrap.bugs (
	bug_id serial4 NOT NULL,
	date_reported date NOT NULL,
	summary varchar(80) NULL,
	description varchar(1000) NULL,
	resolution varchar(1000) NULL,
	reported_by int8 NOT NULL,
	assigned_to int8 NULL,
	verified_by int8 NULL,
	status varchar(20) NOT NULL DEFAULT 'NEW'::character varying,
	priority varchar(20) NULL,
	hours numeric(9, 2) NULL,
	CONSTRAINT bugs_pkey PRIMARY KEY (bug_id)
);


-- bugtrap.bugs foreign keys

ALTER TABLE bugtrap.bugs ADD CONSTRAINT bugs_status_fkey FOREIGN KEY (status) REFERENCES bugtrap.bugstatus(status);


-- bugtrap.bugstatus definition

-- Drop table

-- DROP TABLE bugtrap.bugstatus;

CREATE TABLE bugtrap.bugstatus (
	status varchar(20) NOT NULL,
	CONSTRAINT bugstatus_pkey PRIMARY KEY (status)
);

-- bugtrap.invitations definition

-- Drop table

-- DROP TABLE bugtrap.invitations;

CREATE TABLE bugtrap.invitations (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	email text NOT NULL,
	account_id uuid NULL,
	project_id uuid NULL,
	"role" text NOT NULL,
	"token" text NOT NULL,
	expires_at timestamp NULL DEFAULT (now() + '7 days'::interval),
	status text NULL DEFAULT 'pending'::text,
	created_at timestamp NULL DEFAULT now(),
	deleted_at timestamp NULL,
	updated_at timestamp NULL,
	invited_user_id uuid NOT NULL,
	accepted bool NOT NULL,
	CONSTRAINT invitations_email_account_id_project_id_key UNIQUE (email, account_id, project_id),
	CONSTRAINT invitations_pkey PRIMARY KEY (id),
	CONSTRAINT invitations_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text, 'viewer'::text]))),
	CONSTRAINT invitations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text]))),
	CONSTRAINT invitations_token_key UNIQUE (token)
);


-- bugtrap.invitations foreign keys

ALTER TABLE bugtrap.invitations ADD CONSTRAINT invitations_account_id_fkey FOREIGN KEY (account_id) REFERENCES bugtrap.accounts(id) ON DELETE CASCADE;
ALTER TABLE bugtrap.invitations ADD CONSTRAINT invitations_project_id_fkey FOREIGN KEY (project_id) REFERENCES bugtrap.projects(id) ON DELETE SET NULL;


-- bugtrap.products definition

-- Drop table

-- DROP TABLE bugtrap.products;

CREATE TABLE bugtrap.products (
	product_id serial4 NOT NULL,
	product_name varchar(50) NULL,
	CONSTRAINT products_pkey PRIMARY KEY (product_id)
);

-- bugtrap.project_members definition

-- Drop table

-- DROP TABLE bugtrap.project_members;

CREATE TABLE bugtrap.project_members (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	project_id uuid NULL,
	user_id uuid NULL,
	"role" text NOT NULL,
	created_at timestamp NULL DEFAULT now(),
	deleted_at timestamp NULL,
	updated_at timestamp NULL,
	CONSTRAINT project_members_pkey PRIMARY KEY (id),
	CONSTRAINT project_members_project_id_user_id_key UNIQUE (project_id, user_id),
	CONSTRAINT project_members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text, 'viewer'::text])))
);


-- bugtrap.project_members foreign keys

ALTER TABLE bugtrap.project_members ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES bugtrap.projects(id) ON DELETE CASCADE;
ALTER TABLE bugtrap.project_members ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES bugtrap.users(id) ON DELETE CASCADE;


-- bugtrap.projects definition

-- Drop table

-- DROP TABLE bugtrap.projects;

CREATE TABLE bugtrap.projects (
	id uuid NOT NULL DEFAULT bugtrap.uuid_generate_v4(),
	project_name varchar(100) NOT NULL,
	description text NULL,
	owner_id uuid NOT NULL,
	account_id uuid NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp NULL,
	start_date timestamp NOT NULL,
	end_date timestamp NOT NULL,
	status varchar(20) NOT NULL DEFAULT 'pending'::character varying,
	CONSTRAINT projects_pkey PRIMARY KEY (id),
	CONSTRAINT projects_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'on_hold'::character varying, 'completed'::character varying, 'canceled'::character varying, 'archived'::character varying])::text[])))
);


-- bugtrap.projects foreign keys

ALTER TABLE bugtrap.projects ADD CONSTRAINT projects_account_id_fkey FOREIGN KEY (account_id) REFERENCES bugtrap.accounts(id);
ALTER TABLE bugtrap.projects ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES bugtrap.users(id);

-- bugtrap.users definition

-- Drop table

-- DROP TABLE bugtrap.users;

CREATE TABLE bugtrap.users (
	id uuid NOT NULL DEFAULT bugtrap.uuid_generate_v4(),
	first_name varchar(50) NULL,
	last_name varchar(50) NULL,
	email varchar(100) NOT NULL,
	password_hash bpchar(64) NOT NULL,
	account_id uuid NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);


-- bugtrap.users foreign keys

ALTER TABLE bugtrap.users ADD CONSTRAINT users_account_id_fkey FOREIGN KEY (account_id) REFERENCES bugtrap.accounts(id);


-- bugtrap.screenshots definition

-- Drop table

-- DROP TABLE bugtrap.screenshots;

CREATE TABLE bugtrap.screenshots (
	bug_id int8 NOT NULL,
	image_id int8 NOT NULL,
	screenshot_image bytea NULL,
	caption varchar(100) NULL,
	CONSTRAINT screenshots_pkey PRIMARY KEY (bug_id, image_id)
);


-- bugtrap.screenshots foreign keys

ALTER TABLE bugtrap.screenshots ADD CONSTRAINT screenshots_bug_id_fkey FOREIGN KEY (bug_id) REFERENCES bugtrap.bugs(bug_id);