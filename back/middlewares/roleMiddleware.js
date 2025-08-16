exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }
    
    if (!roles.includes(req.user.role)) {
  console.log("🚨 Role mismatch: ", req.user.role, "Expected roles:", roles);
  return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
}

    next();
  };
};