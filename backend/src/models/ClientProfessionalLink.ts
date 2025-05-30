import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { IClientProfessionalLink } from '../types';
import User from './User';

class ClientProfessionalLink extends Model<IClientProfessionalLink> implements IClientProfessionalLink {
  public id!: number;
  public clientId!: number;
  public professionalId!: number;
  public status!: 'pending' | 'approved' | 'rejected';
  public createdAt!: Date;
  public updatedAt!: Date;
}

ClientProfessionalLink.init(
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
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
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
    tableName: 'client_professional_links',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['clientId', 'professionalId'],
      },
    ],
  }
);

// Removendo as associações duplicadas, pois já estão definidas em models/index.ts

export default ClientProfessionalLink;
