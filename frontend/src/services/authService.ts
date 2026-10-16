import { api } from '../lib/api';
import type { LoginCredentials, LoginResponse, RegisterCredentials } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/auth/login', credentials);
  },

  async register(credentials: RegisterCredentials): Promise<string> {
    return api.post<string>('/api/auth/register', credentials);
  },

  async checkHealth(): Promise<{ status: string; application: string }> {
    return api.get<{ status: string; application: string }>('/api/health');
  },
};
