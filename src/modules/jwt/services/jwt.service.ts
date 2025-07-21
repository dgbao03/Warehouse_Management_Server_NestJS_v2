import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(
        private configService: ConfigService
    ) {}

    sign(payload: string | object | Buffer, secretKey: any, options?: SignOptions) {
        return jwt.sign(payload, secretKey, options);
    }

    verify (token: string, secretKey: any ) {
        return jwt.verify(token, secretKey);
    }
}
