/** Lightweight perimeter controls. Use a shared Redis-backed limiter when scaling beyond one API process. */
const buckets = new Map();

export function getClientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.ip || "unknown").split(",")[0].trim();
}

export function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.baseUrl}${req.path}:${getClientIp(req)}`;
    const now = Date.now();
    const entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ status: "error", message });
    }
    next();
  };
}

export function enforceHttps(req, res, next) {
  if (process.env.NODE_ENV !== "production" || req.secure || req.headers["x-forwarded-proto"] === "https") return next();
  return res.status(426).json({ status: "error", message: "HTTPS is required for this service." });
}
