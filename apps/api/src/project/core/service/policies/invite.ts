import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common"
import { ForbiddenStatus } from "../../constants"

const MAX_PENDING_INVITATIONS = 50

export namespace Invite {
	 export function validateInviteRules(project: any, guestUserId: string, existingInvites: number, allPendingInvites: number) {
			if (project.members.some(m => m.id === guestUserId)) {
				throw new ConflictException('User is already a project member')
			}
	
			if (existingInvites > 0) {
				throw new ConflictException('User already has a pending invitation')
			}
	
			if (allPendingInvites >= MAX_PENDING_INVITATIONS) {
				throw new BadRequestException('Too many pending invitations')
			}
		}

	export function ensureHostCanInvite(project: any, hostUserId: string) {
		if (ForbiddenStatus.includes(project.status)) {
			throw new ForbiddenException('Cannot invite members to this project')
		}

		const isAuthorized = project.members.some(
			m => m.id === hostUserId && ['member', 'admin'].includes(m.role),
		)

		if (!isAuthorized) {
			throw new ForbiddenException('Only project members or admins can invite')
		}
	}

	export function checkPolicies(
		project,
		hostId: string,
		existingInvites: number,
		allPendingInvites: number,
		guestUserId: string,
	) {
		Invite.ensureHostCanInvite(project, hostId)
		Invite.validateInviteRules(project, guestUserId, existingInvites, allPendingInvites)
	}
}