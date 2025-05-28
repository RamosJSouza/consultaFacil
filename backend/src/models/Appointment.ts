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
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
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
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'appointments',
    modelName: 'Appointment',
  }
);

// Define associations
Appointment.belongsTo(User, {
  foreignKey: 'clientId',
  as: 'client',
});

Appointment.belongsTo(User, {
  foreignKey: 'professionalId',
  as: 'professional',
});

export default Appointment;
