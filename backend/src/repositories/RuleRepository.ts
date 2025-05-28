import { IRuleRepository } from './interfaces';
import Rule from '../models/Rule';
import { NotFoundError } from '../utils/errors';
import { IRule } from '../types';

export class SequelizeRuleRepository implements IRuleRepository {
  async findByName(name: string): Promise<Rule | null> {
    return Rule.findOne({ where: { ruleName: name } });
  }

  async findById(id: number): Promise<Rule | null> {
    return Rule.findByPk(id);
  }

  async create(data: IRule): Promise<Rule> {
    return Rule.create(data);
  }

  async update(id: number, data: Partial<Rule>): Promise<Rule> {
    const rule = await Rule.findByPk(id);
    if (!rule) {
      throw new NotFoundError('Rule not found');
    }
    await rule.update(data);
    return rule;
  }

  async delete(id: number): Promise<void> {
    const rule = await Rule.findByPk(id);
    if (!rule) {
      throw new NotFoundError('Rule not found');
    }
    await rule.destroy();
  }

  async findAll(): Promise<Rule[]> {
    return Rule.findAll({
      order: [['ruleName', 'ASC']]
    });
  }
}
