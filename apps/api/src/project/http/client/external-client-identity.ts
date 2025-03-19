import { Injectable } from "@nestjs/common"
import { ConfigService } from "@src/shared/config/service/config.service"

export interface ApiResponse<T extends Record<string, any>> {
  results: Array<T>
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  account_id: string;
  created_at: string;
}

  
 @Injectable()
 export class ExternalIdentityClient {
	constructor(
		private readonly configService: ConfigService,
		// private readonly httpClient: any
	) {}

	async findUserById(ownerId: string): Promise<User> {
    const users = [
      {
        "id": "a3b4c5d6-7e8f-9a10-bb11-cd1234abc567",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "everton.paixao16@gmail.com",
        "password_hash": "29fc9a8f2f3c69a11b9e5ab56bc6e70f                                ",
        "account_id": "f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0",
        "created_at": "2025-02-25T14:29:09.313Z"
      }
    ];
    const user = users.find(u => u.id === ownerId)
    return user || users[0]
  }

  async findUserByEmail(email: string) {
    const users = [
      {
        "id": "a3b4c5d6-7e8f-9a10-bb11-cd1234abc567",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "everton.paixao16@gmail.com",
        "password_hash": "29fc9a8f2f3c69a11b9e5ab56bc6e70f                                ",
        "account_id": "f4c2a1b6-3a92-4fa1-8979-92d9adbc70f0",
        "created_at": "2025-02-25T14:29:09.313Z"
      }
    ]
    const user = users.find(u => u.email === email)
    return user || users[0]
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
}