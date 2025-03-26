import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity';
import { Account } from './account.entity';

@Entity({ name: 'users', schema: 'bugtrap' })
export class User extends DefaultEntity<User> {
  @Column({ type: 'uuid', primary: true, default: () => "uuid_generate_v4()" })
  id: string;

  @Column({ type: 'varchar', nullable: false, name: 'auth0_id' })
  auth0Id: string;

  @Column({ type: 'varchar', nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', nullable: false,  name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true, name: 'password_hash' })
  passwordHash: string;

	@ManyToOne(() => Account, (account) => account.users, { nullable: false })
  account: Account;
}
