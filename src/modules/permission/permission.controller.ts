import { Controller, Get } from '@nestjs/common';
import { PermissionService } from './services/permission.service';
import { Auth } from '../../decorators/permission.decorator';

@Controller('permissions')
export class PermissionController {
    constructor(
        private permissionService: PermissionService
    ) {}

    @Get()
    @Auth("get_all_permissions")
    async getAllPermissions() {
        return this.permissionService.getAllPermissions();
    }
}
