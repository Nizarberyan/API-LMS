export enum Role {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
