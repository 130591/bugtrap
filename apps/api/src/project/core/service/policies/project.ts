import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { DateUtils } from "@src/shared/lib/date-utils"

export namespace ProjectRules {
	export function ensureAccountExists(organization: any) {
		if (!organization || !organization.length) {
			throw new NotFoundException('Account not found')
		}
	}

	export function ensureUserBelongsToOrganization(user: any, organizationId: string) {
		if (user.organizationId !== organizationId) {
			throw new ForbiddenException(`User ${user.email} does not belong to organization ${organizationId}`)
		}
	}

	export function ensureOwnerExists(owner: any) {
		if (!owner) {
			throw new NotFoundException('Owner not found')
		}
	}

	export function ensureValidDates(beginDate: string[]) {
		DateUtils.validateProjectDates(beginDate)
	}

	export function checkPolicies(
		user: any,
		organization: any,
		owner: any,
		beginDate: string[]
	) {
		ensureAccountExists(organization)
		ensureUserBelongsToOrganization(user, organization[0].id)
		ensureOwnerExists(owner)
		ensureValidDates(beginDate)
	}
}
