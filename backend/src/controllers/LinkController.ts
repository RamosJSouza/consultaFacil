import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, UserRole } from '../types';
import ClientProfessionalLink from '../models/ClientProfessionalLink';
import User from '../models/User';
import { Op } from 'sequelize';

export class LinkController {
  // Get all professional links for the authenticated client
  getClientLinks = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      // Ensure user is a client
      if (req.user.role !== UserRole.CLIENT && req.user.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenError('Only clients can access their professional links');
      }

      const clientId = req.user.id;

      const links = await ClientProfessionalLink.findAll({
        where: { clientId },
        include: [
          {
            model: User,
            as: 'professional',
            attributes: ['id', 'name', 'email', 'specialty', 'licenseNumber'],
          },
        ],
      });

      res.json(links);
    } catch (error) {
      next(error);
    }
  };

  // Get all client links for the authenticated professional
  getProfessionalLinks = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      // Ensure user is a professional
      if (req.user.role !== UserRole.PROFESSIONAL && req.user.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenError('Only professionals can access their client links');
      }

      const professionalId = req.user.id;

      const links = await ClientProfessionalLink.findAll({
        where: { professionalId },
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      res.json(links);
    } catch (error) {
      next(error);
    }
  };

  // Create a new link between client and professional
  createLink = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      let { clientId, professionalId } = req.body;

      // If user is a client, they can only link themselves to professionals
      if (req.user.role === UserRole.CLIENT) {
        clientId = req.user.id;
      }

      // If user is a professional, they can only link themselves to clients
      if (req.user.role === UserRole.PROFESSIONAL) {
        professionalId = req.user.id;
      }

      // Validate required fields
      if (!clientId || !professionalId) {
        throw new ValidationError('Missing required fields');
      }

      // Verify the client exists and is active
      const client = await User.findOne({
        where: { id: clientId, role: UserRole.CLIENT, isActive: true },
      });
      if (!client) {
        throw new NotFoundError('Client');
      }

      // Verify the professional exists and is active
      const professional = await User.findOne({
        where: { id: professionalId, role: UserRole.PROFESSIONAL, isActive: true },
      });
      if (!professional) {
        throw new NotFoundError('Professional');
      }

      // Check if the link already exists
      const existingLink = await ClientProfessionalLink.findOne({
        where: { clientId, professionalId },
      });
      if (existingLink) {
        res.status(200).json({ message: 'Link already exists' });
      } else {
        // Create the link
        const link = await ClientProfessionalLink.create({
          clientId,
          professionalId,
        });

        res.status(201).json(link);
      }
    } catch (error) {
      next(error);
    }
  };

  // Delete a link between client and professional
  deleteLink = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User not authenticated');
      }

      let { clientId, professionalId } = req.body;
      
      // Se o usuário for cliente, define o clientId como o ID do usuário autenticado
      if (req.user.role === UserRole.CLIENT) {
        clientId = req.user.id;
      }
      
      // Se o usuário for profissional, define o professionalId como o ID do usuário autenticado
      if (req.user.role === UserRole.PROFESSIONAL) {
        professionalId = req.user.id;
      }

      // Validate required fields
      if (!clientId || !professionalId) {
        throw new ValidationError('Missing required fields');
      }

      // Check if the user has permission to delete this link
      if (
        req.user.role === UserRole.CLIENT && req.user.id !== clientId ||
        req.user.role === UserRole.PROFESSIONAL && req.user.id !== professionalId
      ) {
        throw new ForbiddenError('You do not have permission to delete this link');
      }

      // Find and delete the link
      const link = await ClientProfessionalLink.findOne({
        where: { clientId, professionalId },
      });

      if (!link) {
        throw new NotFoundError('Link');
      }

      await link.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 