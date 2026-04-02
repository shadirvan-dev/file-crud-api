import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
    }
    async create(createUserDto: CreateUserDto) {

        const { email, username, password, name } = createUserDto;

        const existing = await this.userRepo.findOne({
            where: [
                { email },
                { username },
            ],
        });

        if (existing) {
            throw new ConflictException('Email or username already exists');
        }

        const user = this.userRepo.create(createUserDto);
        return await this.userRepo.save(user)

    }

    async findByEmail(email: string) {

        return await this.userRepo.findOne({ where: { email } })

    }

    findAll() {
        return this.userRepo.find();
    }
    findOne(id: string) {
        return this.userRepo.findOneBy({ id })
    }

    async update(id: string, user: UpdateUserDto) {
        const existingUser = await this.userRepo.findOneBy({ id });
        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        if (user.email || user.username) {
            const duplicate = await this.userRepo.findOne({
                where: [
                    ...(user.email ? [{ email: user.email }] : []),
                    ...(user.username ? [{ username: user.username }] : []),
                ],
            });

            if (duplicate && duplicate.id !== id) {
                if (user.email && duplicate.email === user.email) {
                    throw new ConflictException('Email already exists');
                }

                if (user.username && duplicate.username === user.username) {
                    throw new ConflictException('Username already exists');
                }

                throw new ConflictException('Email or username already exists');
            }
        }

        try {
            await this.userRepo.update({ id }, user);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                const driverError = error.driverError as { code?: string; message?: string };
                if (driverError?.code === 'ER_DUP_ENTRY') {
                    const message = driverError.message ?? '';
                    if (message.includes('email')) {
                        throw new ConflictException('Email already exists');
                    }
                    if (message.includes('username')) {
                        throw new ConflictException('Username already exists');
                    }
                    throw new ConflictException('Email or username already exists');
                }
            }

            throw error;
        }

        return await this.findOne(id);
    }

    async remove(id: string) {

        const removed = await (await this.userRepo.delete(id))

        if (removed.affected === 0)
            return new NotFoundException().getResponse()

        return { message: "User Deleted Succesfully" }
    }

    async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
        const user = await this.userRepo.findOneBy({ id });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            updatePasswordDto.currentPassword,
            user.password,
        );

        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        user.password = await bcrypt.hash(updatePasswordDto.newPassword, 10);
        await this.userRepo.save(user);

        return { message: 'Password updated successfully' };
    }



}
