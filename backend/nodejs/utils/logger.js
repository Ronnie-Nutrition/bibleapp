/**
 * Structured logging utility using Winston
 */
const winston = require('winston');
const path = require('path');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format function
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const logObj = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      service: 'nodejs-backend',
      environment: process.env.NODE_ENV || 'development',
    };

    // Add stack trace for errors
    if (info.stack) {
      logObj.stack = info.stack;
    }

    // Add any additional metadata
    if (info.metadata && Object.keys(info.metadata).length > 0) {
      logObj.metadata = info.metadata;
    }

    // Add request information if available
    if (info.req) {
      logObj.request = {
        method: info.req.method,
        url: info.req.url,
        userAgent: info.req.get('User-Agent'),
        ip: info.req.ip || info.req.connection.remoteAddress,
      };
    }

    // Add response information if available
    if (info.res) {
      logObj.response = {
        statusCode: info.res.statusCode,
        responseTime: info.responseTime,
      };
    }

    return JSON.stringify(logObj);
  })
);

// Development format (human readable)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    let message = `${info.timestamp} [${info.level}] ${info.message}`;
    
    if (info.metadata && Object.keys(info.metadata).length > 0) {
      message += ` | ${JSON.stringify(info.metadata)}`;
    }
    
    if (info.stack) {
      message += `\n${info.stack}`;
    }
    
    return message;
  })
);

// Choose format based on environment
const format = process.env.NODE_ENV === 'production' ? customFormat : developmentFormat;

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format,
  defaultMeta: { service: 'nodejs-backend' },
  transports: [
    // Console transport
    new winston.transports.Console(),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'nodejs.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    
    // File transport for errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'nodejs_error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
    
    // File transport for security-related logs
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 20,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  logger.http('Incoming request', {
    metadata: {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentType: req.get('Content-Type'),
    }
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(level, 'Request completed', {
      metadata: {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${duration}ms`,
        contentLength: res.get('Content-Length'),
      }
    });
  });

  next();
};

// Error logging function
const logError = (error, req = null, additional = {}) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    metadata: {
      ...additional,
      errorType: error.constructor.name,
    }
  };

  if (req) {
    errorLog.metadata.request = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };
  }

  logger.error('Unhandled error occurred', errorLog);
};

// Security event logging
const logSecurityEvent = (event, details = {}, req = null) => {
  const securityLog = {
    metadata: {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    }
  };

  if (req) {
    securityLog.metadata.request = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };
  }

  logger.warn('Security event', securityLog);
};

// Performance logging
const logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    metadata: {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    }
  });
};

module.exports = {
  logger,
  requestLogger,
  logError,
  logSecurityEvent,
  logPerformance,
};