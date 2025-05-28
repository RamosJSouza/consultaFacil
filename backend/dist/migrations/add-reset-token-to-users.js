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
            // Adicionar coluna reset_token
            yield queryInterface.addColumn('users', 'reset_token', {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            });
            // Adicionar coluna reset_token_expiry
            yield queryInterface.addColumn('users', 'reset_token_expiry', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            });
            console.log('Migration add-reset-token-to-users: successfully added columns');
        }
        catch (error) {
            console.error('Migration add-reset-token-to-users failed:', error);
            throw error;
        }
    });
}
function down(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Remover as colunas em caso de rollback
            yield queryInterface.removeColumn('users', 'reset_token');
            yield queryInterface.removeColumn('users', 'reset_token_expiry');
            console.log('Migration add-reset-token-to-users: successfully reverted');
        }
        catch (error) {
            console.error('Migration add-reset-token-to-users rollback failed:', error);
            throw error;
        }
    });
}
