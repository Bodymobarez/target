/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

// ----- Auth -----
export type ApiRole = "CUSTOMER" | "ADMIN" | "STAFF" | "VENDOR";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: ApiRole;
}

export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface MeResponse {
  user: AuthUser;
}
