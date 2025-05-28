export interface IEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface IAppointmentEmailData {
  professionalName: string;
  clientName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface IEmailService {
  sendAppointmentNotification(
    to: string,
    data: IAppointmentEmailData
  ): Promise<void>;
}
