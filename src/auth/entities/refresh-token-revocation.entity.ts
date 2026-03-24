import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'refresh_token_revocations' })
export class RefreshTokenRevocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ name: 'token_hash', length: 128 })
    tokenHash: string;

    @Index()
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'expires_at', type: 'datetime' })
    expiresAt: Date;

    @CreateDateColumn({ name: 'revoked_at' })
    revokedAt: Date;
}