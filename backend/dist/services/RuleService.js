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
exports.RuleService = void 0;
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
class RuleService {
    constructor(ruleRepository, auditLogRepository) {
        this.ruleRepository = ruleRepository;
        this.auditLogRepository = auditLogRepository;
    }
    createRule(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.userRole !== types_1.UserRole.SUPERADMIN) {
                throw new errors_1.ForbiddenError('Only superadministrators can create rules');
            }
            // Validate rule value based on rule name
            this.validateRuleValue(data.ruleName, data.ruleValue);
            const rule = yield this.ruleRepository.create({
                ruleName: data.ruleName,
                ruleValue: data.ruleValue,
                createdBy: data.createdBy,
            });
            // Log the action
            yield this.auditLogRepository.create({
                action: 'create_rule',
                performedBy: data.createdBy,
                details: {
                    ruleName: data.ruleName,
                    ruleValue: data.ruleValue,
                },
            });
            return rule;
        });
    }
    updateRule(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.userRole !== types_1.UserRole.SUPERADMIN) {
                throw new errors_1.ForbiddenError('Only superadministrators can update rules');
            }
            const rule = yield this.ruleRepository.findById(id);
            if (!rule) {
                throw new errors_1.ValidationError('Rule not found');
            }
            // Validate rule value based on rule name
            this.validateRuleValue(rule.ruleName, data.ruleValue);
            const updatedRule = yield this.ruleRepository.update(id, {
                ruleValue: data.ruleValue,
            });
            // Log the action
            yield this.auditLogRepository.create({
                action: 'update_rule',
                performedBy: data.updatedBy,
                details: {
                    ruleId: id,
                    oldValue: rule.ruleValue,
                    newValue: data.ruleValue,
                },
            });
            return updatedRule;
        });
    }
    validateRuleValue(ruleName, value) {
        switch (ruleName) {
            case 'max_appointments_per_day':
                if (!Number.isInteger(value.max_appointments_per_day) || value.max_appointments_per_day <= 0) {
                    throw new errors_1.ValidationError('max_appointments_per_day must be a positive integer');
                }
                break;
            case 'min_appointment_duration':
                if (!Number.isInteger(value.min_duration_minutes) || value.min_duration_minutes <= 0) {
                    throw new errors_1.ValidationError('min_duration_minutes must be a positive integer');
                }
                break;
            case 'working_hours':
                if (!value.start_time || !value.end_time ||
                    !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value.start_time) ||
                    !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value.end_time)) {
                    throw new errors_1.ValidationError('Invalid working hours format');
                }
                break;
            default:
                throw new errors_1.ValidationError('Unknown rule type');
        }
    }
}
exports.RuleService = RuleService;
