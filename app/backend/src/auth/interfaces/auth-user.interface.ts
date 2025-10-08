export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  name: string;
  iat?: number;
  exp?: number;
}
