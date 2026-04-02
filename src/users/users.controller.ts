import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UpdatePasswordDto } from 'src/users/dto/update-password.dto';

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


    @UseGuards(JwtAuthGuard)
    @Patch('password')
    updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.usersService.updatePassword(req.user.id, updatePasswordDto);
    }

    @Patch(':id')
    update(@Param() params: UserIdParamDto, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(params.id, updateUserDto)


    }

    @Delete(':id')
    remove(@Param() params: UserIdParamDto) {

        return this.usersService.remove(params.id)
    }
}
