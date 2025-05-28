import { IAvailability } from '../types';
import Availability from '../models/Availability';
import { NotFoundError } from '../utils/errors';
import { Op } from 'sequelize';

export interface IAvailabilityData {
  professionalId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isRecurring: boolean;
}

export interface IAvailabilityRepository {
  findById(id: number): Promise<any>;
  findByProfessionalId(professionalId: number): Promise<any[]>;
  findByProfessionalAndDay(professionalId: number, dayOfWeek: number): Promise<any[]>;
  findOverlappingAvailabilities(
    professionalId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: number
  ): Promise<any[]>;
  create(data: IAvailabilityData): Promise<any>;
  update(id: number, data: Partial<IAvailabilityData>): Promise<any>;
  delete(id: number): Promise<boolean>;
}

export class SequelizeAvailabilityRepository implements IAvailabilityRepository {
  async findAll(): Promise<Availability[]> {
    return Availability.findAll({
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });
  }

  async findById(id: number): Promise<any> {
    return await Availability.findByPk(id);
  }

  async findByProfessionalId(professionalId: number): Promise<any[]> {
    return await Availability.findAll({
      where: { professionalId },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });
  }

  async findByProfessionalAndDay(professionalId: number, dayOfWeek: number): Promise<any[]> {
    return await Availability.findAll({
      where: {
        professionalId,
        dayOfWeek,
        isAvailable: true
      },
      order: [['startTime', 'ASC']]
    });
  }

  async create(data: IAvailabilityData): Promise<any> {
    return await Availability.create(data);
  }

  async update(id: number, data: Partial<IAvailabilityData>): Promise<any> {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      throw new Error('Availability not found');
    }

    await availability.update(data);
    return availability;
  }

  async delete(id: number): Promise<boolean> {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      return false;
    }

    await availability.destroy();
    return true;
  }

  async deleteByProfessionalId(professionalId: number): Promise<number> {
    return Availability.destroy({
      where: { professionalId }
    });
  }

  async findOverlappingAvailabilities(
    professionalId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: number
  ): Promise<any[]> {
    const whereClause: any = {
      professionalId,
      dayOfWeek,
      [Op.or]: [
        {
          // New slot starts during an existing slot
          startTime: {
            [Op.lt]: endTime
          },
          endTime: {
            [Op.gt]: startTime
          }
        },
        {
          // New slot ends during an existing slot
          startTime: {
            [Op.lt]: endTime
          },
          endTime: {
            [Op.gt]: startTime
          }
        },
        {
          // New slot completely contains an existing slot
          startTime: {
            [Op.gte]: startTime
          },
          endTime: {
            [Op.lte]: endTime
          }
        },
        {
          // New slot is completely contained by an existing slot
          startTime: {
            [Op.lte]: startTime
          },
          endTime: {
            [Op.gte]: endTime
          }
        }
      ]
    };

    // Exclude the current availability if updating
    if (excludeId) {
      whereClause.id = {
        [Op.ne]: excludeId
      };
    }

    return await Availability.findAll({
      where: whereClause
    });
  }
} 