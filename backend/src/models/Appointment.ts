import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../config/database';
import { AppointmentStatus } from '../types';
import User from './User';

class Appointment extends Model<
  InferAttributes<Appointment>,
  InferCreationAttributes<Appointment>
> {
  declare id: CreationOptional<number>;
  declare clientId: ForeignKey<User['id']>;
  declare professionalId: ForeignKey<User['id']>;
  declare title: string;
  declare description: CreationOptional<string>;
  declare date: Date;
  declare startTime: string;
  declare endTime: string;
  declare status: AppointmentStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'client_id',
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'professional_id',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'start_time',
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'end_time',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
      defaultValue: AppointmentStatus.PENDING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'appointments',
    modelName: 'Appointment',
  }
);

export default Appointment;
