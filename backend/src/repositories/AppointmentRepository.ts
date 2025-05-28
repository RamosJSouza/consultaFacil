import { IAppointment } from '../types';
import Appointment from '../models/Appointment';
import { NotFoundError } from '../utils/errors';
import { Op } from 'sequelize';

export class SequelizeAppointmentRepository {
  async findAll(): Promise<Appointment[]> {
    return Appointment.findAll({
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
  }

  async findById(id: number): Promise<Appointment | null> {
    return Appointment.findByPk(id);
  }

  async findByClientId(clientId: number): Promise<Appointment[]> {
    return Appointment.findAll({
      where: { clientId },
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
  }

  async findByProfessionalId(professionalId: number): Promise<Appointment[]> {
    return Appointment.findAll({
      where: { professionalId },
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
  }

  async create(data: Partial<IAppointment>): Promise<Appointment> {
    return Appointment.create(data as any);
  }

  async update(id: number, data: Partial<IAppointment>): Promise<Appointment> {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw new NotFoundError('Appointment');
    }
    return appointment.update(data);
  }

  async delete(id: number): Promise<void> {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      throw new NotFoundError('Appointment');
    }
    await appointment.destroy();
  }

  async findOverlappingAppointments(
    professionalId: number,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: number
  ): Promise<Appointment[]> {
    const where: any = {
      professionalId,
      date,
      [Op.or]: [
        {
          startTime: {
            [Op.between]: [startTime, endTime]
          }
        },
        {
          endTime: {
            [Op.between]: [startTime, endTime]
          }
        }
      ]
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    return Appointment.findAll({ where });
  }
}
