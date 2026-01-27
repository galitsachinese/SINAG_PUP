/* eslint-env node */
const { verify } = require('../utils/jwt');

/**
 * Authentication & Authorization Middleware
 *
 * Usage:
 *  - router.use(authMiddleware())
 *  - router.use(authMiddleware(['coordinator']))
 */
function authMiddleware(allowedRoles = []) {
  // normalize roles to array (lowercase)
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => r.toLowerCase())
    : typeof allowedRoles === 'string'
      ? [allowedRoles.toLowerCase()]
      : [];

  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    /* =========================
       1. CHECK AUTH HEADER
    ========================= */
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      /* =========================
         2. VERIFY JWT
      ========================= */
      const payload = verify(token);

      if (!payload?.id || !payload?.role) {
        return res.status(401).json({
          message: 'Invalid token payload',
        });
      }

      /* =========================
         3. ATTACH USER TO REQUEST
      ========================= */
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role.toLowerCase(),
        program: payload.program || null,
        firstName: payload.firstName || null, // ✅ ADD
        lastName: payload.lastName || null, // ✅ ADD
      };

      /* =========================
         4. ROLE-BASED ACCESS CHECK
      ========================= */

      // 🔥 NORMALIZE ROLE (Supervisor = Company)
      let effectiveRole = req.user.role;
      if (effectiveRole === 'supervisor') {
        effectiveRole = 'company';
      }

      if (roles.length && !roles.includes(effectiveRole)) {
        return res.status(403).json({
          message: 'Access denied',
        });
      }

      /* =========================
         5. CONTINUE
      ========================= */
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(401).json({
        message: 'Invalid or expired token',
      });
    }
  };
}

module.exports = authMiddleware;
