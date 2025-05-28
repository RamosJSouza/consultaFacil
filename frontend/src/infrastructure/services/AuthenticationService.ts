import axios from 'axios';
import type { User } from '../../domain/entities/User';
import type { IAuthenticationService, LoginCredentials, RegisterData } from '../../application/ports/IAuthenticationService';
import { config } from '../config';

export class AuthenticationService implements IAuthenticationService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, credentials);
      const { user, token } = response.data;

      this.token = token;
      this.currentUser = user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/register`, data);
      const { user, token } = response.data;

      this.token = token;
      this.currentUser = user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await axios.get(`${config.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.currentUser = response.data;
      return this.currentUser;
    } catch {
      await this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
} 