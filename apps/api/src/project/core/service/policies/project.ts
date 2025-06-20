import { DateUtils } from "@src/shared/lib/date-utils"
import { 
	AccountNotFoundException,
	 OwnerNotFoundException, 
	 UserDoesNotBelongToOrganizationException 
	} from "../../exception"


export namespace ProjectRules {
  export function ensureAccountExists(organization: any) {
    if (!organization || !organization.length) {
      throw new AccountNotFoundException()
    }
  }

  export function ensureUserBelongsToOrganization(user: any, organizationId: string) {
    if (user.organizationId !== organizationId) {
      throw new UserDoesNotBelongToOrganizationException(user.email, organizationId)
    }
  }

  export function ensureOwnerExists(owner: any) {
    if (!owner) {
      throw new OwnerNotFoundException()
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
