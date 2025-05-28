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

class Rule extends Model<InferAttributes<Rule>, InferCreationAttributes<Rule>> {
  declare id: CreationOptional<number>;
  declare ruleName: string;
  declare ruleValue: Record<string, any>;
  declare createdBy: ForeignKey<User['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Rule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ruleName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ruleValue: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'rules',
    modelName: 'Rule',
  }
);

// Define associations
Rule.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

export default Rule;
