import { Entity } from '../shared/Entity';
import { User } from './User';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export interface AppointmentProps {
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  client: User;
  professional: User;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Appointment extends Entity<AppointmentProps> {
  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get date(): Date {
    return this.props.date;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get endTime(): Date {
    return this.props.endTime;
  }

  get client(): User {
    return this.props.client;
  }

  get professional(): User {
    return this.props.professional;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: AppointmentProps, id?: string) {
    super(props, id);
  }

  public static create(props: AppointmentProps, id?: string): Appointment {
    if (props.startTime >= props.endTime) {
      throw new Error('Start time must be before end time');
    }

    if (props.date.getTime() < new Date().setHours(0, 0, 0, 0)) {
      throw new Error('Cannot create appointments in the past');
    }

    return new Appointment(props, id);
  }

  public confirm(): void {
    if (this.props.status !== AppointmentStatus.PENDING) {
      throw new Error('Can only confirm pending appointments');
    }
    this.props.status = AppointmentStatus.CONFIRMED;
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.props.status === AppointmentStatus.CANCELLED) {
      throw new Error('Appointment is already cancelled');
    }
    this.props.status = AppointmentStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }
} 