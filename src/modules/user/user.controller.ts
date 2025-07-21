import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './services/user.service';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { User } from './entities/user.entity';
import { CreateUserDTO, UpdateUserDTO } from './dtos';
import { Auth } from '../../decorators/permission.decorator';
import { CurrentTenant } from '../../decorators/current-tenant.decorator';

@Controller("users")
export class UserController {
    constructor(
        private userService: UserService
    ) {}
    
    @Get()
    @Auth("get_all_users")
    getAllUsers(
        @Query('search') query: string, 
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 5,
        @CurrentTenant() tenantId: string
    ): Promise<Pagination<User>>{
        limit = limit > 5 ? 5 : limit;
        const options: IPaginationOptions = {
            page,
            limit,
            route: '/users', 
        };

        return this.userService.getAllUsers(options, tenantId, query);
    }

    @Get(":id")
    @Auth("get_user_by_id")
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Post()
    @Auth("create_user")
    @UsePipes(new ValidationPipe())
    createUser(@Body() createData: CreateUserDTO, @CurrentTenant() tenantId: string) {
        return this.userService.createUser(createData, tenantId);
    }

    @Put(":id")
    @Auth("update_user")
    @UsePipes(new ValidationPipe())
    updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDTO, @CurrentTenant() tenantId: string) {
        return this.userService.updateUser(id, updateData, tenantId);
    }

    @Delete(":id")
    @Auth("delete_user")
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }

    @Post("/:userId/roles/:roleId")
    @Auth("add_user_role")
    addUserRole(@Param('roleId') roleId: string, @Param('userId') userId: string, @CurrentTenant() tenantId: string) {
        return this.userService.addUserRole(roleId, userId, tenantId);
    }

    @Delete("/:userId/roles/:roleId")
    @Auth("delete_user_role")
    removeUserRole(@Param('roleId') roleId: string, @Param('userId') userId: string, @CurrentTenant() tenantId: string) {
        return this.userService.removeUserRole(roleId, userId, tenantId);
    }
}
