import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { SequelizeRuleRepository } from '../repositories/RuleRepository';

export class RuleController {
  private ruleRepository: SequelizeRuleRepository;

  constructor() {
    this.ruleRepository = new SequelizeRuleRepository();
  }

  getAllRules = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rules = await this.ruleRepository.findAll();
      res.json(rules);
    } catch (error) {
      next(error);
    }
  };

  createRule = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { ruleName, ruleValue } = req.body;

      if (!ruleName || !ruleValue) {
        throw new ValidationError('Rule name and value are required');
      }

      // Check if rule with same name already exists
      const existingRule = await this.ruleRepository.findByName(ruleName);
      if (existingRule) {
        throw new ValidationError('Rule with this name already exists');
      }

      const rule = await this.ruleRepository.create({
        ruleName,
        ruleValue,
        createdBy: req.user!.id,
      });

      res.status(201).json(rule);
    } catch (error) {
      next(error);
    }
  };

  updateRule = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ruleId = parseInt(req.params.id);
      if (isNaN(ruleId)) {
        throw new ValidationError('Invalid rule ID');
      }

      const { ruleName, ruleValue } = req.body;
      if (!ruleName && !ruleValue) {
        throw new ValidationError('Rule name or value must be provided');
      }

      // Check if rule exists
      const existingRule = await this.ruleRepository.findById(ruleId);
      if (!existingRule) {
        throw new NotFoundError('Rule');
      }

      // If updating name, check if new name is already taken
      if (ruleName && ruleName !== existingRule.ruleName) {
        const ruleWithNewName = await this.ruleRepository.findByName(ruleName);
        if (ruleWithNewName) {
          throw new ValidationError('Rule with this name already exists');
        }
      }

      const updatedRule = await this.ruleRepository.update(ruleId, {
        ruleName,
        ruleValue,
      });

      res.json(updatedRule);
    } catch (error) {
      next(error);
    }
  };

  deleteRule = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ruleId = parseInt(req.params.id);
      if (isNaN(ruleId)) {
        throw new ValidationError('Invalid rule ID');
      }

      // Check if rule exists
      const rule = await this.ruleRepository.findById(ruleId);
      if (!rule) {
        throw new NotFoundError('Rule');
      }

      await this.ruleRepository.delete(ruleId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 