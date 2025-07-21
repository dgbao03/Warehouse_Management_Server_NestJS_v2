import { Body, Controller, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SignInPayload } from './dtos';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ){}

    @Post('sign-in/:tenantName')
    @UsePipes(new ValidationPipe())
    signIn(@Body() payload: SignInPayload, @Param('tenantName') tenantName: string) {
        return this.authService.signIn(payload, tenantName);
    }

    @Post('renew-access-token')
    renewAccessToken(@Body("refreshToken") refreshToken: string) {
        return this.authService.renewAccessToken(refreshToken);
    } 

    @Post('sign-out')
    signOut(@Body("refreshToken") refreshToken: string) {
        return this.authService.signOut(refreshToken);
    }
}
