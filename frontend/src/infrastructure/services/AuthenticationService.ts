import axios from 'axios';
import { User } from '../../domain/entities/User';
import type { IAuthenticationService, LoginCredentials, RegisterData } from '../../application/ports/IAuthenticationService';
import { config } from '../config';

export class AuthenticationService implements IAuthenticationService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      this.currentUser = User.create(userData, userData.id);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, credentials);
      const { user: userData, token } = response.data;

      this.token = token;
      this.currentUser = User.create(userData, userData.id);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { user: this.currentUser, token };
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
      const { user: userData, token } = response.data;

      this.token = token;
      this.currentUser = User.create(userData, userData.id);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { user: this.currentUser, token };
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
      const userData = response.data;
      this.currentUser = User.create(userData, userData.id);
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