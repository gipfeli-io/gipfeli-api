import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TokenBearerAuthGuard extends AuthGuard('tokenBearer') {}
