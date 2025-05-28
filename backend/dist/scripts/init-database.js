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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DB_NAME = 'consultafacil', DB_USER = 'postgres', DB_PASSWORD = 'root', DB_HOST = 'localhost', DB_PORT = '5432', } = process.env;
function initDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const sequelize = new sequelize_1.Sequelize({
            database: DB_NAME,
            username: DB_USER,
            password: DB_PASSWORD,
            host: DB_HOST,
            port: parseInt(DB_PORT, 10),
            dialect: 'postgres',
        });
        try {
            // Create users table
            yield sequelize.getQueryInterface().createTable('users', {
                id: {
                    type: sequelize_1.DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                email: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: false,
                },
                role: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: false,
                },
                name: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: false,
                },
                specialty: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: true,
                },
                licenseNumber: {
                    type: sequelize_1.DataTypes.STRING,
                    allowNull: true,
                },
                isActive: {
                    type: sequelize_1.DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                createdAt: {
                    type: sequelize_1.DataTypes.DATE,
                    allowNull: false,
                    defaultValue: sequelize_1.DataTypes.NOW,
                },
                updatedAt: {
                    type: sequelize_1.DataTypes.DATE,
                    allowNull: false,
                    defaultValue: sequelize_1.DataTypes.NOW,
                }
            });
            console.log('Database tables created successfully');
        }
        catch (error) {
            if (((_a = error.original) === null || _a === void 0 ? void 0 : _a.code) === '42P07') {
                console.log('Tables already exist');
            }
            else {
                console.error('Error initializing database:', error);
            }
        }
        finally {
            yield sequelize.close();
        }
    });
}
initDatabase();
