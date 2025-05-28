"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepository_1 = require("../repositories/UserRepository");
const AppointmentRepository_1 = require("../repositories/AppointmentRepository");
const RuleRepository_1 = require("../repositories/RuleRepository");
const AuditLogRepository_1 = require("../repositories/AuditLogRepository");
const AuthService_1 = require("../services/AuthService");
const AppointmentService_1 = require("../services/AppointmentService");
const RuleService_1 = require("../services/RuleService");
const EmailService_1 = require("../services/EmailService");
class Container {
    constructor() {
        this.services = new Map();
        // Initialize repositories
        const userRepository = new UserRepository_1.SequelizeUserRepository();
        const appointmentRepository = new AppointmentRepository_1.SequelizeAppointmentRepository();
        const ruleRepository = new RuleRepository_1.SequelizeRuleRepository();
        const auditLogRepository = new AuditLogRepository_1.SequelizeAuditLogRepository();
        const emailService = new EmailService_1.EmailService();
        // Initialize rule service with proper repositories
        const ruleService = new RuleService_1.RuleService(ruleRepository, auditLogRepository);
        // Initialize services
        this.services.set('authService', new AuthService_1.AuthService(userRepository));
        this.services.set('appointmentService', new AppointmentService_1.AppointmentService(appointmentRepository, ruleRepository, emailService));
        this.services.set('ruleService', ruleService);
        this.services.set('userRepository', userRepository);
        this.services.set('ruleRepository', ruleRepository);
        this.services.set('auditLogRepository', auditLogRepository);
        this.services.set('appointmentRepository', appointmentRepository);
        this.services.set('emailService', emailService);
    }
    static getInstance() {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }
    get(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        return service;
    }
}
exports.default = Container;
