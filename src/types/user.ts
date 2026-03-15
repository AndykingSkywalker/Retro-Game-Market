export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
  role: UserRole;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  role: UserRole;
}