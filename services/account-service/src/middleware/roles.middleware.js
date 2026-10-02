const ROLES_LIST = {
  ADMIN: "ADMIN",
  SUPPORT: "SUPPORT",
  COMPLIANCE: "COMPLIANCE",
  USER: "USER",
};

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const roles = req.user?.roles;

    if (!Array.isArray(roles)) {
      const error = new Error("forbidden");
      error.satausCode = 403;
      return next(error);
    }

    const hasRole = allowedRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = { ROLES_LIST, verifyRoles };
