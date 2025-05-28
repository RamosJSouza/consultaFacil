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
const database_1 = require("../config/database");
const User_1 = __importDefault(require("../models/User"));
function listTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield database_1.sequelize.authenticate();
            console.log('Database connection established successfully.');
            // List all tables
            const tables = yield database_1.sequelize.getQueryInterface().showAllTables();
            console.log('Tables in database:');
            console.log(tables);
            // Check if users table exists and has records
            if (tables.includes('users')) {
                const users = yield User_1.default.findAll();
                console.log(`Total users: ${users.length}`);
                if (users.length > 0) {
                    console.log('User records:');
                    users.forEach(user => {
                        console.log({
                            id: user.id,
                            email: user.email,
                            role: user.role,
                            name: user.name,
                            isActive: user.isActive,
                            createdAt: user.createdAt
                        });
                    });
                }
                else {
                    console.log('No user records found.');
                }
            }
            else {
                console.log('Users table does not exist.');
            }
            process.exit(0);
        }
        catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });
}
listTables();
