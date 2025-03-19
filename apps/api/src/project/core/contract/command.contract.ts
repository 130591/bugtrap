export interface CreateProjectCommand {
  description: string;
  projectName: string;
  beginProject: string[];
  accountId: string;
  ownerId: string;
}

export interface InviteMemberCommand {
  accountId: string
  hostId: string
  guestEmail: string
  projectId: string
  permissions: string[]
}

export interface ConfirmInviteCommand {
  projectId: string
  token: string
}