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
const RuleService_1 = require("../services/RuleService");
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
describe('RuleService', () => {
    let ruleRepository;
    let auditLogRepository;
    let ruleService;
    const mockRule = {
        id: 1,
        ruleName: 'testRule',
        ruleValue: 'testValue',
        createdBy: 1
    };
    beforeEach(() => {
        ruleRepository = {
            create: jest.fn(),
            update: jest.fn(),
            findByName: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
        };
        auditLogRepository = {
            create: jest.fn(),
            findByPerformer: jest.fn(),
        };
        ruleService = new RuleService_1.RuleService(ruleRepository, auditLogRepository);
    });
    describe('createRule', () => {
        it('should create a rule when user is superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            const ruleData = {
                ruleName: 'maxAppointmentsPerDay',
                ruleValue: 10,
                createdBy: 1,
                userRole: types_1.UserRole.SUPERADMIN,
            };
            const createdRule = Object.assign(Object.assign({}, ruleData), { id: 1 });
            ruleRepository.create.mockResolvedValue(createdRule);
            const result = yield ruleService.createRule(ruleData);
            expect(result).toEqual(createdRule);
            expect(ruleRepository.create).toHaveBeenCalledWith({
                ruleName: ruleData.ruleName,
                ruleValue: ruleData.ruleValue,
                createdBy: ruleData.createdBy,
            });
            expect(auditLogRepository.create).toHaveBeenCalled();
        }));
        it('should throw ForbiddenError when user is not superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            const ruleData = {
                ruleName: 'maxAppointmentsPerDay',
                ruleValue: 10,
                createdBy: 1,
                userRole: types_1.UserRole.ADMIN,
            };
            yield expect(ruleService.createRule(ruleData))
                .rejects
                .toThrow(errors_1.ForbiddenError);
        }));
    });
    describe('updateRule', () => {
        it('should update a rule when user is superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            const existingRule = {
                id: 1,
                ruleName: 'maxAppointmentsPerDay',
                ruleValue: 5,
            };
            const updateData = {
                ruleValue: 10,
                updatedBy: 1,
                userRole: types_1.UserRole.SUPERADMIN,
            };
            ruleRepository.findByName.mockResolvedValue(existingRule);
            ruleRepository.update.mockResolvedValue(Object.assign(Object.assign({}, existingRule), { ruleValue: updateData.ruleValue }));
            const result = yield ruleService.updateRule(1, updateData);
            expect(result.ruleValue).toBe(updateData.ruleValue);
            expect(ruleRepository.update).toHaveBeenCalled();
            expect(auditLogRepository.create).toHaveBeenCalled();
        }));
        it('should throw ForbiddenError when user is not superadmin', () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                ruleValue: 10,
                updatedBy: 1,
                userRole: types_1.UserRole.ADMIN,
            };
            yield expect(ruleService.updateRule(1, updateData))
                .rejects
                .toThrow(errors_1.ForbiddenError);
        }));
    });
});
