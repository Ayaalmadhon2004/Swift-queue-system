import logger from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message} - Method: ${req.method} - URL: ${req.originalUrl}`);

    // استخدام let للسماح بتعديل القيم بناءً على نوع الخطأ
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let details = null;

    if (err.name === "ZodError") {
        statusCode = 400;
        message = "Validation Failed";
        details = err.errors.map(e => e.message);
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        details: details,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};