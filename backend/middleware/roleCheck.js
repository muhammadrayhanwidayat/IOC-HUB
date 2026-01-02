const checkRole = (...allowedRoles) => {//middleware untuk cek role user
  return (req, res, next) => {
    //cek apakah req.user ada
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    //cek apakah role user ada di allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

const isAdmin = checkRole('admin');
const isUser = checkRole('user', 'admin');

module.exports = { checkRole, isAdmin, isUser };