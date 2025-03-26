import { Column, Entity, OneToMany } from 'typeorm';
import { DefaultEntity } from '@src/shared/lib/persistence/entity/default.entity';
import { User } from './user.entity';

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

@Entity({ name: 'accounts', schema: 'bugtrap' })
export class Account extends DefaultEntity<Account> {
  @Column({ type: 'uuid', primary: true, default: () => "uuid_generate_v4()" })
  id: string;

  @Column({ type: 'varchar', nullable: false, name: 'account_name' })
  accountName: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'enum', name: 'account_status', enum: AccountStatus, default: AccountStatus.PENDING })
  status: AccountStatus;

  @Column({ type: 'varchar', name: 'activation_token', length: 255, nullable: true })
  activationToken: string;

  @Column({ type: 'bytea', nullable: true, name: 'portrait_image' })
  portraitImage: Buffer;

  @Column({ type: 'numeric', precision: 9, scale: 2, nullable: true })
  hourlyRate: number;

  @OneToMany(() => User, (user) => user.account)
  users: User[];
}
