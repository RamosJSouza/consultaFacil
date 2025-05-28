import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

class Availability extends Model<
  InferAttributes<Availability>,
  InferCreationAttributes<Availability>
> {
  declare id: CreationOptional<number>;
  declare professionalId: ForeignKey<User['id']>;
  declare dayOfWeek: number; // 0-6 (Sunday-Saturday)
  declare startTime: string; // HH:MM:SS format
  declare endTime: string; // HH:MM:SS format
  declare isAvailable: boolean;
  declare isRecurring: boolean; // Indica se a disponibilidade se repete semanalmente
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Availability.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
      field: 'day_of_week',
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
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_available',
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_recurring',
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
    tableName: 'availabilities',
    modelName: 'Availability',
    underscored: true,
  }
);

// Define associations
Availability.belongsTo(User, {
  foreignKey: 'professionalId',
  as: 'professional',
});

export default Availability; 