import { Injectable, NotFoundException } from '@nestjs/common'
import { ExternalPublicClient } from '@src/identity/http/client/external-public-api'
import { ApplicationException } from '@src/shared/exception/application.exception'
import { LoggerService } from '@src/shared/lib/logger'

export interface ApiResponse<T extends Record<string, any>> {
  results: Array<T>
}

  
@Injectable()
export class ExternalIdentityClient {
constructor(
  private readonly logger: LoggerService,
  private readonly identityClient: ExternalPublicClient,
  // private readonly httpClient: any
) {}

async findUserById(ownerId: string) {
  const user = await this.identityClient.findUserByIdAPI(ownerId)
  user.githubUsername
  if (!user) {
      this.logger.error(
      'One or more users not found in external identity system',
      {
        who: 'system_process',
        where: 'AddMemberService.ensureAllUsersExist',
        why: 'user_not_found_external_service',
        externalSystem: 'external_identity_service',
        notFoundUsers: ownerId
      }
    )
  }
  return user|| null
}

async findUserByEmail(email: string) {
    const user = await this.identityClient.findUserByEmailAPI(email)

    if (!user) {
      this.logger.error(
        'User not found in external identity system',
        {
          who: 'system_process', // Or the actor triggering this action
          where: 'AddUserAsOwnerService.ensureUserExists',
          why: 'user_email_not_found_external_service',
          externalSystem: 'external_identity_service',
          userEmail: email,
        }
      )
      throw new NotFoundException('User not exist')
    }

    return user
}

async findOrganizationById(organizationId: string): Promise<any> {
  return await  [
      {
        "id" : "96a5898b-05fb-444e-b0b5-e7cf92b388bb",
        "account_name" : "MyCompany",
        "first_name" : "John",
        "last_name" : "Doe",
        "email" : "john.doe@mycompany.com",
        "password_hash" : "6c5db1a24c039bb83f497a8a163ee64e                                ",
        "portrait_image" : null,
        "hourly_rate" : 45.50,
        "organization_id": "96a5898b-05fb-444e-b0b5-e7cf92b388bb",
      }
    ]
  }


  async createUser(email: string) {
   try {
    const userInfo =  await this.identityClient.registerUser(email)
    return this.findUserById(userInfo.userId)
   } catch (error) {
    throw new ApplicationException({ 
      message: 'Something went wront qhen try to interact with identity module', 
      suggestedHttpStatusCode: 409
    })
   }
  }
}