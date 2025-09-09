import { ApiResponse } from "./response"

export enum ProjectStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  ARCHIVED = 'archived',
} 

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}


export type Project = {
	id: string
	project_name: string
	description: string
	startDate: Date
	endDate: Date
	account_id: string
	owner_id: string
	status: ProjectStatus
	priority: ProjectPriority
	tags: string[]
	favorites: Favorite[]
	members: Member[]
	invitations: Invitation[]
}

export type Member = {
	id: string
	project_id: string
	user_id: string
	role: 'admin' | 'member' | 'viewer'
	created_at: Date
	project: Project
}

export type Invitation = {
  id: string
  email: string
  account_id: string | null
  project_id: string | null
  role: 'admin' | 'member' | 'viewer'
  token: string
  expires_at: Date | null
  status: 'pending' | 'accepted' | 'expired'
  invited_user_id: string
  accepted: boolean
  project: Project
}

export type Favorite = {
  id: string
  userId: string
  projectId: string
  createdAt: Date
  context?: string
  note?: string
  accountId?: string
  projectAccountId?: string
  project: Project
}

export type { ApiResponse }