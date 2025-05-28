import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, UserRole, AppointmentStatus } from '../types';
import { SequelizeAppointmentRepository } from '../repositories/AppointmentRepository';
import { SequelizeUserRepository } from '../repositories/UserRepository';

export class AppointmentController {
  private appointmentRepository: SequelizeAppointmentRepository;
  private userRepository: SequelizeUserRepository;

  constructor() {
    this.appointmentRepository = new SequelizeAppointmentRepository();
    this.userRepository = new SequelizeUserRepository();
  }

  getAllAppointments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointments = await this.appointmentRepository.findAll();
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  };

  getUserAppointments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      let appointments;
      if (req.user.role === UserRole.CLIENT) {
        appointments = await this.appointmentRepository.findByClientId(req.user.id);
      } else if (req.user.role === UserRole.PROFESSIONAL) {
        appointments = await this.appointmentRepository.findByProfessionalId(req.user.id);
      } else {
        appointments = await this.appointmentRepository.findAll();
      }

      res.json(appointments);
    } catch (error) {
      next(error);
    }
  };

  getAppointmentById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        throw new ValidationError('Invalid appointment ID');
      }

      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError('Appointment');
      }

      // Check if user has access to this appointment
      if (
        req.user?.role !== UserRole.SUPERADMIN &&
        req.user?.id !== appointment.clientId &&
        req.user?.id !== appointment.professionalId
      ) {
        throw new ForbiddenError('Access denied');
      }

      res.json(appointment);
    } catch (error) {
      next(error);
    }
  };

  createAppointment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const { professionalId, date, startTime, endTime, title, description } = req.body;

      // Validate required fields
      if (!professionalId || !date || !startTime || !endTime || !title) {
        throw new ValidationError('Missing required fields');
      }

      // Check if professional exists and is active
      const professional = await this.userRepository.findById(professionalId);
      if (!professional || !professional.isActive || professional.role !== UserRole.PROFESSIONAL) {
        throw new ValidationError('Invalid professional');
      }

      // Check for overlapping appointments
      const overlappingAppointments = await this.appointmentRepository.findOverlappingAppointments(
        professionalId,
        new Date(date),
        startTime,
        endTime
      );

      if (overlappingAppointments.length > 0) {
        throw new ValidationError('Professional is not available at this time');
      }

      const appointment = await this.appointmentRepository.create({
        clientId: req.user.id,
        professionalId,
        date: new Date(date),
        startTime,
        endTime,
        title,
        description,
        status: AppointmentStatus.PENDING
      });

      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  };

  updateAppointment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        throw new ValidationError('Invalid appointment ID');
      }

      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError('Appointment');
      }

      // Check if user has permission to update
      if (
        req.user?.role !== UserRole.SUPERADMIN &&
        req.user?.id !== appointment.clientId &&
        req.user?.id !== appointment.professionalId
      ) {
        throw new ForbiddenError('Access denied');
      }

      // If updating date/time, check for overlapping appointments
      if (req.body.date || req.body.startTime || req.body.endTime) {
        const overlappingAppointments = await this.appointmentRepository.findOverlappingAppointments(
          appointment.professionalId,
          new Date(req.body.date || appointment.date),
          req.body.startTime || appointment.startTime,
          req.body.endTime || appointment.endTime,
          appointmentId
        );

        if (overlappingAppointments.length > 0) {
          throw new ValidationError('Professional is not available at this time');
        }
      }

      const updatedAppointment = await this.appointmentRepository.update(
        appointmentId,
        req.body
      );
      res.json(updatedAppointment);
    } catch (error) {
      next(error);
    }
  };

  updateAppointmentStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        throw new ValidationError('Invalid appointment ID');
      }

      const { status } = req.body;
      if (!Object.values(AppointmentStatus).includes(status)) {
        throw new ValidationError('Invalid status');
      }

      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError('Appointment');
      }

      // Check permissions based on status change
      if (status === AppointmentStatus.CONFIRMED && 
          req.user?.role !== UserRole.PROFESSIONAL && 
          req.user?.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenError('Only professionals can confirm appointments');
      }

      const updatedAppointment = await this.appointmentRepository.update(
        appointmentId,
        { status }
      );
      res.json(updatedAppointment);
    } catch (error) {
      next(error);
    }
  };

  cancelAppointment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        throw new ValidationError('Invalid appointment ID');
      }

      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError('Appointment');
      }

      // Check if user has permission to cancel
      if (
        req.user?.role !== UserRole.SUPERADMIN &&
        req.user?.id !== appointment.clientId &&
        req.user?.id !== appointment.professionalId
      ) {
        throw new ForbiddenError('Access denied');
      }

      const updatedAppointment = await this.appointmentRepository.update(
        appointmentId,
        { status: AppointmentStatus.CANCELLED }
      );
      res.json(updatedAppointment);
    } catch (error) {
      next(error);
    }
  };

  confirmAppointment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        throw new ValidationError('Invalid appointment ID');
      }

      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError('Appointment');
      }

      // Only the professional can confirm appointments
      if (
        req.user?.role !== UserRole.SUPERADMIN &&
        req.user?.id !== appointment.professionalId
      ) {
        throw new ForbiddenError('Only professionals can confirm appointments');
      }

      const updatedAppointment = await this.appointmentRepository.update(
        appointmentId,
        { status: AppointmentStatus.CONFIRMED }
      );
      res.json(updatedAppointment);
    } catch (error) {
      next(error);
    }
  };
} 