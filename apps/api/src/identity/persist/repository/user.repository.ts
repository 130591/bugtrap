import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/typeorm/repository/default-type.repository'
import { UserRole } from '../entities/user-roles.entity'
import { User } from '../entities/user.entity'


@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {

	constructor(
		@InjectDataSource('identity')
		protected readonly dataSource: DataSource
	) {
		super(User, dataSource.manager)
	}

	 async getUserRoles(userId: string): Promise<UserRole[]> {
    const user = await this.find({
      where: { id: userId },
      relations: ['userRoles'],
    });

    if (!user) {
      return []
    }

    return user.userRoles
  }

	async findByEmail(email: string) {
		try {
			return await this.find({ 
				where: { 
					email: email, 
					isVerified: true
				},
				relations: ['userRoles'],	
				relationLoadStrategy: 'join' 
			})
		} catch (error) {
			throw error
		}
	}
}