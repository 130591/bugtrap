import { Generated } from 'kysely'

export interface DefaultTableSchema {
  id: Generated<string>
}

export interface DatabaseSchema {
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type MemberRole = 'admin' | 'member' | 'viewer' | 'contributor'
export type OrganizationType = 'community' | 'business' | 'non-profit'

export interface DefaultTableSchema {
  id: Generated<string>
  created_at: Generated<Date>
  updated_at: Generated<Date>
}


export interface ProjectsTable extends DefaultTableSchema {
  project_name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  organization_id: string;
  owner_id: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  tags: string[];
  search_vector?: any;
}

export interface ProjectMembersTable { 
  project_id: string;
  user_id: string; 
  role: MemberRole;
  joined_at: Generated<Date>;
}

export interface IssuesTable extends DefaultTableSchema {
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  type: string | null;
  reported_by: string;
  assigned_to: string | null;
  verified_by: string | null;
  date_reported: Generated<Date>;
  date_resolved: Date | null;
  hours_spent: number | null;
  github_issue_id: string | null;
  github_issue_url: string | null;
}

export interface IssueCommentsTable extends DefaultTableSchema {
  issue_id: string;
  user_id: string;
  content: string;
  // created_at: Generated<Date>; // Already in DefaultTableSchema
  // updated_at: Generated<Date>; // Already in DefaultTableSchema
}

export interface IssueHistoryTable extends DefaultTableSchema {
  issue_id: string;
  user_id: string;
  change_type: string; 
  old_value: string | null;
  new_value: string | null;
}

export interface OrganizationsTable extends DefaultTableSchema {
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  type: OrganizationType;
  created_by: string;
  deleted_at: Date | null;
}

export interface Database {
  projects: ProjectsTable;
  project_members: ProjectMembersTable; 
  issues: IssuesTable;
  issue_comments: IssueCommentsTable;
  issue_history: IssueHistoryTable;
  organizations: OrganizationsTable;
  // Add any other tables you have in your database schema here
}