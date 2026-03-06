import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await api.post('/auth/login', data);
  return response.data.data;
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await api.post('/auth/register', data);
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data.data.user;
}

export function setAccessToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export function removeAccessToken(): void {
  localStorage.removeItem('accessToken');
}
