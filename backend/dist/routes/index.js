"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointments_1 = __importDefault(require("./appointments"));
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const rules_1 = __importDefault(require("./rules"));
const notifications_1 = __importDefault(require("./notifications"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/appointments', appointments_1.default);
router.use('/users', users_1.default);
router.use('/rules', rules_1.default);
router.use('/notifications', notifications_1.default);
exports.default = router;
