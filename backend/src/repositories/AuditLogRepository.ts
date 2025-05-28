import { IAuditLogRepository } from './interfaces';
import AuditLog from '../models/AuditLog';
import { IAuditLog } from '../types';

export class SequelizeAuditLogRepository implements IAuditLogRepository {
  async create(data: IAuditLog): Promise<AuditLog> {
    return AuditLog.create(data);
  }

  async findByPerformer(performerId: number): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { performedBy: performerId },
      order: [['createdAt', 'DESC']],
    });
  }
}
