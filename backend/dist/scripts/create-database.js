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
const { DB_USER = 'postgres', DB_PASSWORD = 'root', DB_HOST = 'localhost', DB_PORT = '5432', } = process.env;
function createDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Connect to default postgres database first
        const sequelize = new sequelize_1.Sequelize({
            database: 'postgres',
            username: DB_USER,
            password: DB_PASSWORD,
            host: DB_HOST,
            port: parseInt(DB_PORT, 10),
            dialect: 'postgres',
        });
        try {
            // Create the consultafacil database
            yield sequelize.query('CREATE DATABASE consultafacil;');
            console.log('Database consultafacil created successfully');
        }
        catch (error) {
            if (((_a = error.original) === null || _a === void 0 ? void 0 : _a.code) === '42P04') {
                console.log('Database consultafacil already exists');
            }
            else {
                console.error('Error creating database:', error);
            }
        }
        finally {
            yield sequelize.close();
        }
    });
}
createDatabase();
