import { IRuleRepository, IAuditLogRepository } from '../repositories/interfaces';
import { ValidationError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';

export class RuleService {
  constructor(
    private ruleRepository: IRuleRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async createRule(data: {
    ruleName: string;
    ruleValue: any;
    createdBy: number;
    userRole: UserRole;
  }) {
    if (data.userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenError('Only superadministrators can create rules');
    }

    // Validate rule value based on rule name
    this.validateRuleValue(data.ruleName, data.ruleValue);

    const rule = await this.ruleRepository.create({
      ruleName: data.ruleName,
      ruleValue: data.ruleValue,
      createdBy: data.createdBy,
    });

    // Log the action
    await this.auditLogRepository.create({
      action: 'create_rule',
      performedBy: data.createdBy,
      details: {
        ruleName: data.ruleName,
        ruleValue: data.ruleValue,
      },
    });

    return rule;
  }

  async updateRule(id: number, data: {
    ruleValue: any;
    updatedBy: number;
    userRole: UserRole;
  }) {
    if (data.userRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenError('Only superadministrators can update rules');
    }    const rule = await this.ruleRepository.findById(id);
    if (!rule) {
      throw new ValidationError('Rule not found');
    }

    // Validate rule value based on rule name
    this.validateRuleValue(rule.ruleName, data.ruleValue);

    const updatedRule = await this.ruleRepository.update(id, {
      ruleValue: data.ruleValue,
    });

    // Log the action
    await this.auditLogRepository.create({
      action: 'update_rule',
      performedBy: data.updatedBy,
      details: {
        ruleId: id,
        oldValue: rule.ruleValue,
        newValue: data.ruleValue,
      },
    });

    return updatedRule;
  }

  private validateRuleValue(ruleName: string, value: any) {
    switch (ruleName) {
      case 'max_appointments_per_day':
        if (!Number.isInteger(value.max_appointments_per_day) || value.max_appointments_per_day <= 0) {
          throw new ValidationError('max_appointments_per_day must be a positive integer');
        }
        break;

      case 'min_appointment_duration':
        if (!Number.isInteger(value.min_duration_minutes) || value.min_duration_minutes <= 0) {
          throw new ValidationError('min_duration_minutes must be a positive integer');
        }
        break;

      case 'working_hours':
        if (!value.start_time || !value.end_time || 
            !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value.start_time) ||
            !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value.end_time)) {
          throw new ValidationError('Invalid working hours format');
        }
        break;

      default:
        throw new ValidationError('Unknown rule type');
    }
  }
}
