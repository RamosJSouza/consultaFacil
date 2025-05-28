"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class ClientProfessionalLink extends sequelize_1.Model {
}
ClientProfessionalLink.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    clientId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    professionalId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    sequelize: database_1.default,
    tableName: 'client_professional_links',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['clientId', 'professionalId'],
        },
    ],
});
ClientProfessionalLink.belongsTo(User_1.default, { as: 'client', foreignKey: 'clientId' });
ClientProfessionalLink.belongsTo(User_1.default, { as: 'professional', foreignKey: 'professionalId' });
exports.default = ClientProfessionalLink;
