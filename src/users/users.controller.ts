import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) { }
    @Post()
    create(@Body() createUserDto: CreateUserDto) {

        return this.usersService.create(createUserDto)

    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
        return this.usersService.findOne(req.user.id)
    }

    // @Get()
    // findAll() {
    //     return this.usersService.findAll()

    // }
    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.usersService.findOne(id)

    // }
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        console.log(updateUserDto)
        return this.usersService.update(id, updateUserDto)


    }

    @Delete(':id')
    remove(@Param('id') id: string) {

        return this.usersService.remove(id)
    }
}
