import { User } from 'src/users/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';


@Entity()
export class FileEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'original_name' })
    originalName: string;

    @Column({ name: 'stored_name' })
    storedName: string;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @Column({ type: 'bigint' })
    size: number;

    @Index()
    @Column({ name: 'owner_id', type: 'uuid' })
    ownerId: string;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}