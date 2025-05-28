import { Entity } from '../shared/Entity';
import { UserRole } from './UserRole';

export interface UserProps {
  email: string;
  name: string;
  role: UserRole;
  specialty?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: Date;
}

export class User extends Entity<UserProps> {
  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get specialty(): string | undefined {
    return this.props.specialty;
  }

  get licenseNumber(): string | undefined {
    return this.props.licenseNumber;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): User {
    return new User(props, id);
  }
} 