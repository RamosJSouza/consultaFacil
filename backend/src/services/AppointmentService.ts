import { IAppointmentRepository } from '../repositories/interfaces';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { IRuleRepository } from '../repositories/interfaces';
import { IEmailService } from '../types/emailTypes';
import { UserRole } from '../types';

export class AppointmentService {  constructor(
    private appointmentRepository: IAppointmentRepository,
    private ruleRepository: IRuleRepository,
    private emailService?: IEmailService
  ) {}
  async createAppointment(data: {
    title: string;
    description?: string;
    date: Date;
    startTime: string;
    endTime: string;
    professionalId: number;
    clientId: number;
    client?: { email: string; name: string };
    professional?: { email: string; name: string };
  }) {
    // Validate times
    if (data.startTime >= data.endTime) {
      throw new ValidationError('End time must be after start time');
    }

    // Validate future date
    if (new Date(data.date) < new Date()) {
      throw new ValidationError('Appointment date must be in the future');
    }

    // Check appointment rules
    const maxAppointmentsRule = await this.ruleRepository.findByName('max_appointments_per_day');
    if (maxAppointmentsRule) {
      const existingAppointments = await this.appointmentRepository.findByProfessionalId(data.professionalId);
      const sameDay = existingAppointments.filter(
        apt => apt.date.toISOString().split('T')[0] === data.date.toISOString().split('T')[0]
      );

      if (sameDay.length >= maxAppointmentsRule.ruleValue.max_appointments_per_day) {
        throw new ValidationError('Professional has reached maximum appointments for this day');
      }
    }

    // Check for conflicts
    const conflicts = await this.appointmentRepository.findConflicts(
      data.professionalId,
      data.date,
      data.startTime,
      data.endTime
    );

    if (conflicts.length > 0) {
      throw new ValidationError('Time slot is already booked');
    }    // Create appointment
    const appointment = await this.appointmentRepository.create({
      ...data,
      status: 'pending',
    });

    // Send email notifications
    if (this.emailService && data.client?.email && data.professional?.email) {
      const emailData = {
        professionalName: data.professional.name,
        clientName: data.client.name,
        title: data.title,
        date: data.date.toLocaleDateString(),
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'pending'
      };

      try {
        // Send to client
        await this.emailService.sendAppointmentNotification(
          data.client.email,
          emailData
        );

        // Send to professional
        await this.emailService.sendAppointmentNotification(
          data.professional.email,
          emailData
        );
      } catch (error) {
        // Log error but don't fail the appointment creation
        console.error('Failed to send email notifications:', error);
      }
    }

    return appointment;
  }
  async updateAppointmentStatus(
    appointmentId: number,
    status: 'pending' | 'confirmed' | 'cancelled',
    userId: number,
    userRole: UserRole
  ) {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    // Validate permissions
    if (
      userRole === UserRole.CLIENT &&
      appointment.clientId !== userId
    ) {
      throw new ForbiddenError();
    }

    if (
      userRole === UserRole.PROFESSIONAL &&
      appointment.professionalId !== userId
    ) {
      throw new ForbiddenError();
    }

    // Update status
    const updatedAppointment = await this.appointmentRepository.update(appointmentId, { status });    // Send email notifications if we have the associated users
    if (this.emailService && appointment.client?.email && appointment.professional?.email) {
      const emailData = {
        professionalName: appointment.professional.name,
        clientName: appointment.client.name,
        title: appointment.title,
        date: appointment.date.toLocaleDateString(),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status
      };

      try {
        // Send to client
        await this.emailService.sendAppointmentNotification(
          appointment.client.email,
          emailData
        );

        // Send to professional
        await this.emailService.sendAppointmentNotification(
          appointment.professional.email,
          emailData
        );
      } catch (error) {
        // Log error but don't fail the status update
        console.error('Failed to send email notifications:', error);
      }
    }

    return updatedAppointment;
  }

  async getAppointments(userId: number, userRole: UserRole) {
    switch (userRole) {
      case UserRole.CLIENT:
        return this.appointmentRepository.findByClientId(userId);
      case UserRole.PROFESSIONAL:
        return this.appointmentRepository.findByProfessionalId(userId);
      case UserRole.SUPERADMIN:
        // For superadmin, we could implement a method to get all appointments with pagination
        throw new Error('Not implemented');
      default:
        throw new ForbiddenError();
    }
  }
}
