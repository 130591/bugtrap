import { NotFoundException, Injectable, ConflictException, GoneException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PublisherService } from '@src/shared/lib/hive'
import { ConfirmInviteCommand } from '../contract/command.contract'
import { InvitationRepository } from '@src/project/persist/repository/invitation.repository'
import { ExternalIdentityClient } from '@src/project/http/client'
import { InviteEvent } from '@src/shared/event'

@Injectable()
export class ConfirmInvitationService {
	constructor(
		private readonly generator: JwtService,
		private readonly event: PublisherService,
		private readonly publicAPI: ExternalIdentityClient,
		private readonly repository: InvitationRepository) {}

	private isExpire(expirationTimestamp: number) {
		return expirationTimestamp < Math.floor(Date.now() / 1000)
	}

	private validateInvitation(invite: any | null, token: string) {
		if (!invite) throw new NotFoundException('Invitation not found or expired')
		if (invite.status !== 'pending') throw new ConflictException('Invitation already processed')
	
		const invitation = this.generator.decode(token, { json: true })
		if (invitation.sub !== invite.email) throw new ConflictException('Invitation already processed')
		if (this.isExpire(invitation.exp)) throw new GoneException('This invitation was expired')
	}

	async execute(command: ConfirmInviteCommand) {
		const [invite, user] = await Promise.all([
			this.repository.findInviteByToken(command.token),
			this.publicAPI.findUserByEmail(command.token),
		])

		this.validateInvitation(invite, command.token)

		invite.accepted = true
    invite.status = 'accepted'

		await this.repository.confirmInvitation(invite)
		await this.event.emit(InviteEvent.CONFIRM_INVITATION, { ...invite, already_user: !!user })
	
		return {
			accepted: invite.accepted,
			status: invite.status,
		  email: invite.email,
		  projectId: invite.project_id
		}
	}
}