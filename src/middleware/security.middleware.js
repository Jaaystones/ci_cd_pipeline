import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';


export const securityMiddleware = async (req , res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;
    let message;

    switch(role) {
      case 'admin':
        limit = 20;
        message = 'Admin rate limit exceededd (20 per minute). slow down.';
        break;
      case 'user':
        limit = 10;
        message = 'User rate limit exceeded (10 per minute). please slow down.';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest rate limit exceeded (5 per minute). please slow down.';
        break;
    }
    
    const client = aj.withRule(slidingWindow({
      mode: 'LIVE',
      interval: 60, // 1 minute
      max: limit,
      name:`${role}-rate-limit` 
    }));

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn(`Blocked bot request from ${req.ip}`, { userAgent: req.get('User-Agent'), path: req.path});

      res.status(403).json({ error: 'Access denied: Bot traffic is not allowed.' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn(`Shield blocked request from ${req.ip}`, { userAgent: req.get('User-Agent'), path: req.path, method:req.method});
        
      res.status(403).json({ error: 'Access denied: Request blocked by shield policy.' });
    }

    if (decision.isDenied() && decision.reason.isRateLmit()) {
      logger.warn(`Rate limit exceeded from ${req.ip}`, { userAgent: req.get('User-Agent'), path: req.path, method:req.method});
        
      res.status(403).json({ error: 'Access denied: To many requests.' });
    }

    next();

  } catch (e) {
    console.error('Arcjet middleware error:', e);
    // Optionally handle errors, e.g., send a 500 response
    res.status(500).json({ error: 'Internal Server Error', message:'Something went wrong with security middleware' });
  };
};