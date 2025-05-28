"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.url}`,
    });
};
exports.notFoundHandler = notFoundHandler;
