const jwt = require('jsonwebtoken');//import jwt
const jwtConfig = require('../config/jwt');//import config jwt
const { User } = require('../models');//import model User

const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];//ambil token dari header Authorization

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }
    //verifikasi token
    const decoded = jwt.verify(token, jwtConfig.access.secret);
    
    //cek user di database berdasarkan id di token
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }
    //simpan info user di req.user untuk dipakai di middleware/route selanjutnya
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    //lanjut ke middleware/route berikutnya
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};
//middleware untuk verifikasi refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    const decoded = jwt.verify(refreshToken, jwtConfig.refresh.secret);
    
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active || user.refresh_token !== refreshToken) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired refresh token' 
    });
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };