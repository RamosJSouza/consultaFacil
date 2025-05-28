import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Container from '../config/container';

export const getProfessionals = async (_req: AuthRequest, res: Response) => {
  try {
    const userRepository = Container.getInstance().get('userRepository');
    const professionals = await userRepository.findActiveProfessionals();
    res.json(professionals);
  } catch (error) {
    console.error('Get professionals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
