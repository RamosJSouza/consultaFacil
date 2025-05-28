import axios from 'axios';
import { User } from '../../domain/entities/User';
import type { UserProps } from '../../domain/entities/User';
import type { IUserService } from '../../application/ports/IUserService';
import type { UserRole } from '../../domain/entities/UserRole';
import { config } from '../config';

interface UserResponse extends UserProps {
  id: string;
}

export class UserService implements IUserService {
  private readonly authToken: string | null;

  constructor() {
    this.authToken = localStorage.getItem('token');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.authToken}`
    };
  }

  async getUsers(filters?: {
    role?: UserRole;
    isActive?: boolean;
  }): Promise<User[]> {
    try {
      const response = await axios.get<UserResponse[]>(`${config.apiUrl}/users`, {
        headers: this.headers,
        params: filters
      });
      return response.data.map(userData => User.create(userData, userData.id));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get users');
      }
      throw new Error('Failed to get users');
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      const response = await axios.get<UserResponse>(`${config.apiUrl}/users/${id}`, {
        headers: this.headers
      });
      return User.create(response.data, response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get user');
      }
      throw new Error('Failed to get user');
    }
  }

  async updateUser(id: string, data: {
    name?: string;
    specialty?: string;
    licenseNumber?: string;
    isActive?: boolean;
  }): Promise<User> {
    try {
      const response = await axios.put<UserResponse>(`${config.apiUrl}/users/${id}`, data, {
        headers: this.headers
      });
      return User.create(response.data, response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update user');
      }
      throw new Error('Failed to update user');
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/users/${id}/deactivate`, {}, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to deactivate user');
      }
      throw new Error('Failed to deactivate user');
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/users/${id}/activate`, {}, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to activate user');
      }
      throw new Error('Failed to activate user');
    }
  }

  async linkProfessional(clientId: string, professionalId: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/users/${clientId}/link-professional/${professionalId}`, {}, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to link professional');
      }
      throw new Error('Failed to link professional');
    }
  }

  async unlinkProfessional(clientId: string, professionalId: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/users/${clientId}/unlink-professional/${professionalId}`, {}, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to unlink professional');
      }
      throw new Error('Failed to unlink professional');
    }
  }

  async getLinkedProfessionals(clientId: string): Promise<User[]> {
    try {
      const response = await axios.get<UserResponse[]>(`${config.apiUrl}/users/${clientId}/linked-professionals`, {
        headers: this.headers
      });
      return response.data.map(userData => User.create(userData, userData.id));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get linked professionals');
      }
      throw new Error('Failed to get linked professionals');
    }
  }

  async getLinkedClients(professionalId: string): Promise<User[]> {
    try {
      const response = await axios.get<UserResponse[]>(`${config.apiUrl}/users/${professionalId}/linked-clients`, {
        headers: this.headers
      });
      return response.data.map(userData => User.create(userData, userData.id));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get linked clients');
      }
      throw new Error('Failed to get linked clients');
    }
  }
} 