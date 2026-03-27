import logger from "../lib/logger";

export const errorHandler=(err,req,res,next)=>{
    logger.error(`${err.name}: ${err.message} - Method: ${req.method} - URL: ${req.originalUrl}`);

    const statusCode=err.statusCode || 500;
    const message=err.message || "Internel Server Error";
    let details=null;

    if (err.name === "ZodError") {
        statusCode = 400;
        message = "Validation Failed";
        details = err.errors.map(e => e.message);
        logger.warn(`⚠️ Validation Warning: ${JSON.stringify(details)}`);
    } else {
        logger.error(`🔥 Error: ${message} - Stack: ${err.stack}`);
    }

    res.status(statusCode).json({
        success:false,
        status:statusCode,
        message:message,
        stack:process.env.NODE_ENV==='production' ? null : err.stack,
    });
};