import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        const { email, name } = createUserDto;
        return this.usersService.create(email, name)
    }
    @Get()
    findAll() {
        return this.usersService.findAll()

    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id)

    }
}
