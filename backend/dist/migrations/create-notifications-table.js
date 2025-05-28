"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
function up(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield queryInterface.createTable('notifications', {
                id: {
                    type: sequelize_1.DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                user_id: {
                    type: sequelize_1.DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                message: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: false,
                },
                is_read: {
                    type: sequelize_1.DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                created_at: {
                    type: sequelize_1.DataTypes.DATE,
                    allowNull: false,
                    defaultValue: sequelize_1.DataTypes.NOW,
                },
                updated_at: {
                    type: sequelize_1.DataTypes.DATE,
                    allowNull: false,
                    defaultValue: sequelize_1.DataTypes.NOW,
                },
            });
            // Criar índice para melhorar a performance das consultas por usuário
            yield queryInterface.addIndex('notifications', ['user_id']);
            console.log('Migration create-notifications-table: successfully created table and index');
        }
        catch (error) {
            console.error('Migration create-notifications-table failed:', error);
            throw error;
        }
    });
}
function down(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield queryInterface.dropTable('notifications');
            console.log('Migration create-notifications-table: successfully reverted');
        }
        catch (error) {
            console.error('Migration create-notifications-table rollback failed:', error);
            throw error;
        }
    });
}
