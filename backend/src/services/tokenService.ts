import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '../types';
import env from '../config/env';

export interface TokenPayload {
  id: number;
  role: UserRole;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

type ExpirationString = `${number}${'s' | 'm' | 'h' | 'd'}`;

class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiration: ExpirationString;
  private readonly refreshTokenExpiration: ExpirationString;

  constructor() {
    this.accessTokenSecret = env.JWT_SECRET;
    this.refreshTokenSecret = env.JWT_SECRET + '_refresh';
    this.accessTokenExpiration = env.JWT_EXPIRES_IN as ExpirationString;
    this.refreshTokenExpiration = env.JWT_REFRESH_EXPIRES_IN as ExpirationString;
  }

  generateTokens(payload: TokenPayload): TokenResponse {
    const accessTokenOptions: SignOptions = {
      expiresIn: this.accessTokenExpiration,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: this.refreshTokenExpiration,
    };

    const accessToken = jwt.sign(
      payload,
      this.accessTokenSecret,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      payload,
      this.refreshTokenSecret,
      refreshTokenOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirationTime(this.accessTokenExpiration),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
  }

  private getExpirationTime(expiration: ExpirationString): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default to 1 hour

    const [, value, unit] = match;
    const multipliers: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return parseInt(value) * (multipliers[unit] || 3600);
  }
}

export default new TokenService(); 