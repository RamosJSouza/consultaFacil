export interface NotificationProps {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment_status' | 'system';
  read: boolean;
  createdAt: string;
  metadata?: {
    appointmentId?: string;
    status?: string;
  };
}

export class Notification {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly message: string;
  readonly type: 'appointment_status' | 'system';
  readonly read: boolean;
  readonly createdAt: Date;
  readonly metadata?: {
    appointmentId?: string;
    status?: string;
  };

  private constructor(props: NotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.message = props.message;
    this.type = props.type;
    this.read = props.read;
    this.createdAt = new Date(props.createdAt);
    this.metadata = props.metadata;
  }

  static create(props: NotificationProps): Notification {
    return new Notification(props);
  }
} 