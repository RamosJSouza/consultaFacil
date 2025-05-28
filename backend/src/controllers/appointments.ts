import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Appointment from '../models/Appointment';
import User from '../models/User';
import { UserRole } from '../types';

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, startTime, endTime, professionalId } = req.body;
    const clientId = req.user?.id;

    if (!clientId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !professionalId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Check if professional exists
    const professional = await User.findOne({
      where: { id: professionalId, role: UserRole.PROFESSIONAL, isActive: true },
    });

    if (!professional) {
      res.status(404).json({ message: 'Professional not found' });
      return;
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      where: {
        professionalId,
        date,
        status: 'confirmed',
        [Symbol('or')]: [
          {
            startTime: { [Symbol('between')]: [startTime, endTime] },
          },
          {
            endTime: { [Symbol('between')]: [startTime, endTime] },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      res.status(400).json({ message: 'Time slot is already booked' });
      return;
    }

    const appointment = await Appointment.create({
      clientId,
      professionalId,
      title,
      description,
      date,
      startTime,
      endTime,
      status: 'pending',
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let appointments;
    if (userRole === UserRole.SUPERADMIN) {
      appointments = await Appointment.findAll({
        include: [
          { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'professional', attributes: ['id', 'name', 'specialty'] },
        ],
      });
    } else {
      const whereClause = userRole === UserRole.CLIENT
        ? { clientId: userId }
        : { professionalId: userId };

      appointments = await Appointment.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'professional', attributes: ['id', 'name', 'specialty'] },
        ],
      });
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    // Validate permissions
    if (userRole === UserRole.CLIENT && appointment.clientId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (userRole === UserRole.PROFESSIONAL && appointment.professionalId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await appointment.update({ status });
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
