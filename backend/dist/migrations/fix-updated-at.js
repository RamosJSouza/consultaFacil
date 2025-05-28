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
            // Step 1: Add the column as nullable first
            yield queryInterface.addColumn('users', 'updated_at', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            });
            // Step 2: Update existing records
            yield queryInterface.sequelize.query(`
      UPDATE users 
      SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP) 
      WHERE updated_at IS NULL
    `);
            // Step 3: Make the column non-nullable
            yield queryInterface.changeColumn('users', 'updated_at', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            });
        }
        catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    });
}
function down(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        yield queryInterface.removeColumn('users', 'updated_at');
    });
}
