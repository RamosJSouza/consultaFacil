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
exports.SequelizeRuleRepository = void 0;
const Rule_1 = __importDefault(require("../models/Rule"));
const errors_1 = require("../utils/errors");
class SequelizeRuleRepository {
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return Rule_1.default.findOne({ where: { ruleName: name } });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Rule_1.default.findByPk(id);
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Rule_1.default.create(data);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const rule = yield Rule_1.default.findByPk(id);
            if (!rule) {
                throw new errors_1.NotFoundError('Rule not found');
            }
            yield rule.update(data);
            return rule;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const rule = yield Rule_1.default.findByPk(id);
            if (!rule) {
                throw new errors_1.NotFoundError('Rule not found');
            }
            yield rule.destroy();
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return Rule_1.default.findAll({
                order: [['ruleName', 'ASC']]
            });
        });
    }
}
exports.SequelizeRuleRepository = SequelizeRuleRepository;
