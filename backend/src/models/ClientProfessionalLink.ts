import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { IClientProfessionalLink } from '../types';
import User from './User';

class ClientProfessionalLink extends Model<IClientProfessionalLink> implements IClientProfessionalLink {
  public id!: number;
  public clientId!: number;
  public professionalId!: number;
  public createdAt!: Date;
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
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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

ClientProfessionalLink.belongsTo(User, { as: 'client', foreignKey: 'clientId' });
ClientProfessionalLink.belongsTo(User, { as: 'professional', foreignKey: 'professionalId' });

export default ClientProfessionalLink;
