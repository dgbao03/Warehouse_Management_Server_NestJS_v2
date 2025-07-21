import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { RoleModule } from '../role/role.module';
import { ConfigModule } from '@nestjs/config';
import { PermissionModule } from '../permission/permission.module';
import { TenantModule } from '../tenant/tenant.module';
import { JwtModule } from '../jwt/jwt.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
  imports: [RoleModule, ConfigModule, JwtModule, PermissionModule, TenantModule, forwardRef(() => UserModule)],
})
export class AuthModule {}
