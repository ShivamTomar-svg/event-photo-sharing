export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
