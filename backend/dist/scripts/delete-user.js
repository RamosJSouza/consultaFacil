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
function deleteUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield database_1.sequelize.authenticate();
            console.log('Database connection established successfully.');
            // Find user by email
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                console.log(`No user found with email: ${email}`);
                process.exit(0);
            }
            // Delete user
            yield user.destroy();
            console.log(`User with email ${email} has been deleted.`);
            process.exit(0);
        }
        catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });
}
// Get email from command line argument
const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address as an argument.');
    console.log('Example: npx ts-node ./src/scripts/delete-user.ts example@email.com');
    process.exit(1);
}
deleteUser(email);
