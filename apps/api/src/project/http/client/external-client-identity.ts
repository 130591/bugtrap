import { Injectable, NotFoundException } from "@nestjs/common"
import { ExternalPublicClient } from "@src/identity/http/client/external-public-api";
import { ConfigService } from "@src/shared/config/service/config.service"
import { ApplicationException } from "@src/shared/exception/application.exception";

export interface ApiResponse<T extends Record<string, any>> {
  results: Array<T>
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  account_id: string;
  created_at: Date;
}

  
@Injectable()
export class ExternalIdentityClient {
constructor(
  private readonly configService: ConfigService,
  private readonly identityClient: ExternalPublicClient,
  // private readonly httpClient: any
) {}

async findUserById(ownerId: string): Promise<User> {
  const users = await this.identityClient.findUserByIdAPI(ownerId)
  return users[0] || null
}

async findUserByEmail(email: string) {
  const user = await this.identityClient.findUserByEmailAPI(email)

  if (!user) {
    throw new NotFoundException(`User not found`);
  }

  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    // account_id: user..id,
    created_at: new Date(user.createdAt)
  }
}

async findAccountById(accountId: string): Promise<any> {
  return await  [
      {
        "id" : "f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0",
        "account_name" : "MyCompany",
        "first_name" : "John",
        "last_name" : "Doe",
        "email" : "john.doe@mycompany.com",
        "password_hash" : "6c5db1a24c039bb83f497a8a163ee64e                                ",
        "portrait_image" : null,
        "hourly_rate" : 45.50
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