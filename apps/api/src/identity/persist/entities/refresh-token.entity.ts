import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { DefaultEntity } from '@src/shared/lib/persistence/typeorm/entity/default.entity'
import { User } from './user.entity'

@Entity({ name: 'user_refresh_tokens' })
export class RefreshToken extends DefaultEntity<RefreshToken>  {
  @PrimaryColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column('text')
  token: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date
}
