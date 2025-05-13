import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { User } from "@src/project/http/client/external-client-identity"
import { DateUtils } from "@src/shared/lib/date-utils"

export namespace ProjectRules {
	export function ensureAccountExists(account: any) {
		if (!account || !account.length) {
			throw new NotFoundException('Account not found')
		}
	}

	export function ensureUserBelongsToAccount(user: User, accountId: string) {
		console.log('user.account_id', user.account_id)
		console.log('accountId', accountId)
		if (user.account_id !== accountId) {
			throw new ForbiddenException(`User ${user.email} does not belong to account ${accountId}`)
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
		user: User,
		account: any,
		owner: any,
		beginDate: string[]
	) {
		ensureAccountExists(account)
		ensureUserBelongsToAccount(user, account[0].id)
		ensureOwnerExists(owner)
		ensureValidDates(beginDate)
	}
}
