import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits to 500 requests per 15 minutes per IP
 * Sufficient for normal browsing (multiple page loads, real-time updates)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Realistic limit for active user browsing
  message: 'Too many requests from this IP, please try again in 15 minutes.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Auth rate limiter
 * Allows for legitimate failed login attempts while preventing brute force
 * Limits to 40 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Realistic limit - allows password mistakes without locking out users
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Payment rate limiter
 * Prevents abuse of payment/checkout endpoints
 * Limits to 50 requests per 15 minutes per IP
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many payment requests',
      message: 'Too many payment requests. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Email rate limiter
 * Prevents spam of bulk email endpoints
 * Limits to 20 requests per hour per IP
 */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many email requests',
      message: 'Too many email requests. Please try again in 1 hour.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});
