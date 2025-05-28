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
function dropTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const sequelize = new sequelize_1.Sequelize({
            database: DB_NAME,
            username: DB_USER,
            password: DB_PASSWORD,
            host: DB_HOST,
            port: parseInt(DB_PORT, 10),
            dialect: 'postgres',
        });
        try {
            // Drop all tables
            yield sequelize.getQueryInterface().dropAllTables();
            console.log('All tables dropped successfully');
        }
        catch (error) {
            console.error('Error dropping tables:', error);
        }
        finally {
            yield sequelize.close();
        }
    });
}
dropTables();
