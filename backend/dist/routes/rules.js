"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RuleController_1 = require("../controllers/RuleController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
const ruleController = new RuleController_1.RuleController();
/**
 * @swagger
 * /api/rules:
 *   get:
 *     summary: Get all rules
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth_1.authenticate, (0, express_async_handler_1.default)(ruleController.getAllRules));
/**
 * @swagger
 * /api/rules:
 *   post:
 *     summary: Create new rule (superadmin only)
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ruleName
 *               - ruleValue
 *             properties:
 *               ruleName:
 *                 type: string
 *               ruleValue:
 *                 type: object
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.SUPERADMIN), (0, express_async_handler_1.default)(ruleController.createRule));
/**
 * @swagger
 * /api/rules/{id}:
 *   put:
 *     summary: Update rule (superadmin only)
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ruleName:
 *                 type: string
 *               ruleValue:
 *                 type: object
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.SUPERADMIN), (0, express_async_handler_1.default)(ruleController.updateRule));
/**
 * @swagger
 * /api/rules/{id}:
 *   delete:
 *     summary: Delete rule (superadmin only)
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.SUPERADMIN), (0, express_async_handler_1.default)(ruleController.deleteRule));
exports.default = router;
