import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
    }
    create(email: string, name: string) {
        const user = this.userRepo.create({ email, name });
        return this.userRepo.save(user)

    }
    findAll() {
        return this.userRepo.find();
    }
    findOne(id: string) {
        return this.userRepo.findOneBy({ id })
    }

}
