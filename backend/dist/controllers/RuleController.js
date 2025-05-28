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
exports.RuleController = void 0;
const errors_1 = require("../utils/errors");
const RuleRepository_1 = require("../repositories/RuleRepository");
class RuleController {
    constructor() {
        this.getAllRules = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const rules = yield this.ruleRepository.findAll();
                res.json(rules);
            }
            catch (error) {
                next(error);
            }
        });
        this.createRule = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { ruleName, ruleValue } = req.body;
                if (!ruleName || !ruleValue) {
                    throw new errors_1.ValidationError('Rule name and value are required');
                }
                // Check if rule with same name already exists
                const existingRule = yield this.ruleRepository.findByName(ruleName);
                if (existingRule) {
                    throw new errors_1.ValidationError('Rule with this name already exists');
                }
                const rule = yield this.ruleRepository.create({
                    ruleName,
                    ruleValue,
                    createdBy: req.user.id,
                });
                res.status(201).json(rule);
            }
            catch (error) {
                next(error);
            }
        });
        this.updateRule = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruleId = parseInt(req.params.id);
                if (isNaN(ruleId)) {
                    throw new errors_1.ValidationError('Invalid rule ID');
                }
                const { ruleName, ruleValue } = req.body;
                if (!ruleName && !ruleValue) {
                    throw new errors_1.ValidationError('Rule name or value must be provided');
                }
                // Check if rule exists
                const existingRule = yield this.ruleRepository.findById(ruleId);
                if (!existingRule) {
                    throw new errors_1.NotFoundError('Rule');
                }
                // If updating name, check if new name is already taken
                if (ruleName && ruleName !== existingRule.ruleName) {
                    const ruleWithNewName = yield this.ruleRepository.findByName(ruleName);
                    if (ruleWithNewName) {
                        throw new errors_1.ValidationError('Rule with this name already exists');
                    }
                }
                const updatedRule = yield this.ruleRepository.update(ruleId, {
                    ruleName,
                    ruleValue,
                });
                res.json(updatedRule);
            }
            catch (error) {
                next(error);
            }
        });
        this.deleteRule = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruleId = parseInt(req.params.id);
                if (isNaN(ruleId)) {
                    throw new errors_1.ValidationError('Invalid rule ID');
                }
                // Check if rule exists
                const rule = yield this.ruleRepository.findById(ruleId);
                if (!rule) {
                    throw new errors_1.NotFoundError('Rule');
                }
                yield this.ruleRepository.delete(ruleId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
        this.ruleRepository = new RuleRepository_1.SequelizeRuleRepository();
    }
}
exports.RuleController = RuleController;
