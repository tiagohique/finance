import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, JwtPayload } from './interfaces/auth-user.interface';
import { PublicUser } from '../users/dto/public-user.dto';

interface LoginResult {
  token: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET ?? 'change-me';
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  constructor(private readonly usersService: UsersService) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.usersService.validateCredentials(
      dto.username,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      name: user.name,
    };
    const token = jwt.sign(
      payload as jwt.JwtPayload,
      this.jwtSecret as jwt.Secret,
      { expiresIn: this.jwtExpiresIn as jwt.SignOptions['expiresIn'] },
    );

    return {
      token,
      user: this.usersService.toPublicUser(user),
    };
  }

  verifyToken(token: string): AuthenticatedUser {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return {
        id: payload.sub,
        username: payload.username,
        name: payload.name,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
