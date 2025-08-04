const restrictToRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.userRole;
      console.log("User role from token:", userRole);

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Access denied: User role '${userRole}' is not authorized for this action`,
          status: 403,
        });
      }

      next();
    } catch (error) {
      console.error("Error in restrictToRoles:", error);
      return res.status(500).json({
        message: "Internal server error",
        status: 500,
      });
    }
  };
};

module.exports = restrictToRoles;
