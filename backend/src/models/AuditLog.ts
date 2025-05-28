import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface IAuditLog {
  id?: number;
  action: string;
  performedBy: number;
  details: any;
  createdAt?: Date;
}

class AuditLog extends Model<IAuditLog> implements IAuditLog {
  public id!: number;
  public action!: string;
  public performedBy!: number;
  public details!: any;
  public createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    performedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
  }
);

AuditLog.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

export default AuditLog;
