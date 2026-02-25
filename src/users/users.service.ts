import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt'

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
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({
            email,
            name,
            username,
            password: hashedPassword
        });
        return this.userRepo.save(user)

    }
    findAll() {
        return this.userRepo.find();
    }
    findOne(id: string) {
        return this.userRepo.findOneBy({ id })
    }

}
