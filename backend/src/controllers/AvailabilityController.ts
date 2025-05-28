import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, UserRole } from '../types';
import { SequelizeAvailabilityRepository } from '../repositories/AvailabilityRepository';
import { SequelizeUserRepository } from '../repositories/UserRepository';

export class AvailabilityController {
  private availabilityRepository: SequelizeAvailabilityRepository;
  private userRepository: SequelizeUserRepository;

  constructor() {
    this.availabilityRepository = new SequelizeAvailabilityRepository();
    this.userRepository = new SequelizeUserRepository();
  }

  // Get all availabilities for the authenticated professional
  getProfessionalAvailability = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      // Only professionals can get their availability
      if (req.user.role !== UserRole.PROFESSIONAL && req.user.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenError('Only professionals can access availability');
      }

      const professionalId = parseInt(req.params.professionalId || req.user.id.toString());

      // If a professional is trying to get another professional's availability
      if (req.user.role === UserRole.PROFESSIONAL && professionalId !== req.user.id) {
        throw new ForbiddenError('Professionals can only access their own availability');
      }

      // Verify the professional exists
      const professional = await this.userRepository.findById(professionalId);
      if (!professional || !professional.isActive || professional.role !== UserRole.PROFESSIONAL) {
        throw new NotFoundError('Professional');
      }

      const availabilities = await this.availabilityRepository.findByProfessionalId(professionalId);
      res.json(availabilities);
    } catch (error) {
      next(error);
    }
  };

  // Get available time slots for a specific professional and day
  getAvailableTimeSlots = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.professionalId);
      const dayOfWeek = parseInt(req.params.dayOfWeek);

      if (isNaN(professionalId) || isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        throw new ValidationError('Invalid professional ID or day of week');
      }

      // Verify the professional exists
      const professional = await this.userRepository.findById(professionalId);
      if (!professional || !professional.isActive || professional.role !== UserRole.PROFESSIONAL) {
        throw new NotFoundError('Professional');
      }

      const availabilities = await this.availabilityRepository.findByProfessionalAndDay(
        professionalId,
        dayOfWeek
      );

      res.json(availabilities);
    } catch (error) {
      next(error);
    }
  };

  // Create new availability
  createAvailability = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      // Only professionals can set their availability
      if (req.user.role !== UserRole.PROFESSIONAL && req.user.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenError('Only professionals can set availability');
      }

      const { dayOfWeek, startTime, endTime, isAvailable = true, isRecurring = true } = req.body;
      const professionalId = req.user.role === UserRole.SUPERADMIN && req.body.professionalId
        ? parseInt(req.body.professionalId)
        : req.user.id;

      // Validate required fields
      if (dayOfWeek === undefined || !startTime || !endTime) {
        throw new ValidationError('Missing required fields');
      }

      if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new ValidationError('Day of week must be between 0 and 6');
      }

      // Check for overlapping availabilities
      const overlappingAvailabilities = await this.availabilityRepository.findOverlappingAvailabilities(
        professionalId,
        dayOfWeek,
        startTime,
        endTime
      );

      if (overlappingAvailabilities.length > 0) {
        throw new ValidationError('Time slot overlaps with existing availability');
      }

      const availability = await this.availabilityRepository.create({
        professionalId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        isRecurring
      });

      res.status(201).json(availability);
    } catch (error) {
      next(error);
    }
  };

  // Update availability
  updateAvailability = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const availabilityId = parseInt(req.params.id);
      if (isNaN(availabilityId)) {
        throw new ValidationError('Invalid availability ID');
      }

      const availability = await this.availabilityRepository.findById(availabilityId);
      if (!availability) {
        throw new NotFoundError('Availability');
      }

      // Check if user has permission to update
      if (
        req.user.role !== UserRole.SUPERADMIN &&
        req.user.id !== availability.professionalId
      ) {
        throw new ForbiddenError('Access denied');
      }

      // Check for overlapping availabilities if updating time
      if (req.body.dayOfWeek !== undefined || req.body.startTime || req.body.endTime) {
        const overlappingAvailabilities = await this.availabilityRepository.findOverlappingAvailabilities(
          availability.professionalId,
          req.body.dayOfWeek !== undefined ? req.body.dayOfWeek : availability.dayOfWeek,
          req.body.startTime || availability.startTime,
          req.body.endTime || availability.endTime,
          availabilityId
        );

        if (overlappingAvailabilities.length > 0) {
          throw new ValidationError('Time slot overlaps with existing availability');
        }
      }

      const updatedAvailability = await this.availabilityRepository.update(
        availabilityId,
        req.body
      );

      res.json(updatedAvailability);
    } catch (error) {
      next(error);
    }
  };

  // Delete availability
  deleteAvailability = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      const availabilityId = parseInt(req.params.id);
      if (isNaN(availabilityId)) {
        throw new ValidationError('Invalid availability ID');
      }

      const availability = await this.availabilityRepository.findById(availabilityId);
      if (!availability) {
        throw new NotFoundError('Availability');
      }

      // Check if user has permission to delete
      if (
        req.user.role !== UserRole.SUPERADMIN &&
        req.user.id !== availability.professionalId
      ) {
        throw new ForbiddenError('Access denied');
      }

      await this.availabilityRepository.delete(availabilityId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
} 