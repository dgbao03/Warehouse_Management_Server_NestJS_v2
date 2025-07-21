import { BadRequestException, Injectable, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '../../../modules/jwt/services/jwt.service';
import UserRepository from '../../../modules/user/repositories/user.repository';
import { RoleService } from '../../../modules/role/services/role.service';
import TenantRepository from '../../../modules/tenant/repositories/tenant.repository';
import { RedisService } from '../../../modules/redis/services/redis.service';
import { SignInPayload } from '../dtos';
import { v4 as uuidv4 } from 'uuid';
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';


@Injectable()
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private configService: ConfigService,
        private jwtService: JwtService,
        private roleService: RoleService,
        private tenantRepository: TenantRepository,
        private redisService: RedisService
    ){}

    hashPassword(plainPassword: string) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(plainPassword, salt);
    }

    async comparePassword(plainPassword: string, hashedPassword: string) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async signIn(payload: SignInPayload, tenantName: string) {
        const tenant = await this.tenantRepository.findOne({ where: { name: tenantName } });
        if (!tenant) throw new NotFoundException("Store not found! Please try again!");

        const user = await this.userRepository.findOne({ 
            where: { email: payload.email, tenant: { name: tenantName } }, 
            relations: ['userRoles', 'userRoles.role', 'tenant'] 
        });
        if (!user) throw new NotFoundException("Email not exist! Please try again!");

        const checkPassword = await this.comparePassword(payload.password, user.password);
        if(!checkPassword) throw new BadRequestException("Password is incorrect! Please try again!");

        const userRoles = await this.roleService.getUserRoles(user.id);

        const accessToken = this.jwtService.sign(
            {
                id: user.id,
                email: user.email,
                roles: userRoles,
                tenant: user.tenant.id,
                jti: uuidv4()
            },

            this.configService.getOrThrow("ACCESS_SECRET_TOKEN"),

            {
                expiresIn: "2h"
            }
        )

        const refreshToken = this.jwtService.sign(
            {
                id: user.id,
                email: user.email,
                roles: userRoles,
                tenant: user.tenant.id,
                jti: uuidv4()
            },

            this.configService.getOrThrow("REFRESH_SECRET_TOKEN"),

            {
                expiresIn: "10h"
            }
        )
        
        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        }
    }

    async signOut(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, this.configService.getOrThrow("REFRESH_SECRET_TOKEN")) as JwtPayload;

            const remainingTime = (decoded.exp! - Math.floor(Date.now() / 1000)) * 1000;
    
            await this.redisService.setCache(decoded.jti!, "Blacklisted", remainingTime);
    
            return { message: "Signed out successfully!" }
        } catch (error) {
            if (error instanceof TokenExpiredError) throw new UnauthorizedException("Refresh token expired! Please login again!");
            if (error instanceof JsonWebTokenError) throw new UnauthorizedException('Invalid refresh token! Please login again!');

            throw error;
        }
    }

    async renewAccessToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, this.configService.getOrThrow("REFRESH_SECRET_TOKEN")) as JwtPayload;

            const isBlacklisted = await this.redisService.getCache(decoded.jti!);
            if (isBlacklisted) throw new UnauthorizedException("Refresh token has been revoked! Please sign in again!");

            return { 
                accessToken: this.jwtService.sign(
                    {
                        id: decoded.id,
                        email: decoded.email,
                        roles: decoded.roles,
                        tenant: decoded.tenant
    
                    },
        
                    this.configService.getOrThrow("ACCESS_SECRET_TOKEN"),
        
                    {
                        expiresIn: "2h"
                    }
                ) 
            }
        } catch (error) {
            if (error instanceof TokenExpiredError) throw new UnauthorizedException("Refresh token expired! Please login again!");
            if (error instanceof JsonWebTokenError) throw new UnauthorizedException('Invalid refresh token! Please login again!');

            throw error;
        }
    }
}
