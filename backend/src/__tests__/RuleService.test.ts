import { RuleService } from '../services/RuleService';
import { UserRole } from '../types';
import { ValidationError, ForbiddenError } from '../utils/errors';

describe('RuleService', () => {
  let ruleRepository: any;
  let auditLogRepository: any;
  let ruleService: RuleService;
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

    ruleService = new RuleService(ruleRepository, auditLogRepository);
  });

  describe('createRule', () => {
    it('should create a rule when user is superadmin', async () => {
      const ruleData = {
        ruleName: 'maxAppointmentsPerDay',
        ruleValue: 10,
        createdBy: 1,
        userRole: UserRole.SUPERADMIN,
      };

      const createdRule = { ...ruleData, id: 1 };
      ruleRepository.create.mockResolvedValue(createdRule);
      
      const result = await ruleService.createRule(ruleData);
      
      expect(result).toEqual(createdRule);
      expect(ruleRepository.create).toHaveBeenCalledWith({
        ruleName: ruleData.ruleName,
        ruleValue: ruleData.ruleValue,
        createdBy: ruleData.createdBy,
      });
      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user is not superadmin', async () => {
      const ruleData = {
        ruleName: 'maxAppointmentsPerDay',
        ruleValue: 10,
        createdBy: 1,
        userRole: UserRole.ADMIN,
      };

      await expect(ruleService.createRule(ruleData))
        .rejects
        .toThrow(ForbiddenError);
    });
  });

  describe('updateRule', () => {
    it('should update a rule when user is superadmin', async () => {
      const existingRule = {
        id: 1,
        ruleName: 'maxAppointmentsPerDay',
        ruleValue: 5,
      };

      const updateData = {
        ruleValue: 10,
        updatedBy: 1,
        userRole: UserRole.SUPERADMIN,
      };

      ruleRepository.findByName.mockResolvedValue(existingRule);
      ruleRepository.update.mockResolvedValue({ ...existingRule, ruleValue: updateData.ruleValue });

      const result = await ruleService.updateRule(1, updateData);

      expect(result.ruleValue).toBe(updateData.ruleValue);
      expect(ruleRepository.update).toHaveBeenCalled();
      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user is not superadmin', async () => {
      const updateData = {
        ruleValue: 10,
        updatedBy: 1,
        userRole: UserRole.ADMIN,
      };

      await expect(ruleService.updateRule(1, updateData))
        .rejects
        .toThrow(ForbiddenError);
    });
  });
});
