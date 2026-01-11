const jwt = require('jsonwebtoken');//import jwt
const crypto = require('crypto');
const { User } = require('../models');//import model User
const jwtConfig = require('../config/jwt');//import config jwt

//fungsi untuk generate access dan refresh token
const generateTokens = (user) => {
  //buat payload token
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  //generate access token
  const accessToken = jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn,
  });
  //generate refresh token
  const refreshToken = jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn,
  });

  return { accessToken, refreshToken };
};

//controller untuk register
exports.register = async (req, res) => {
  try {
    //dapatkan data dari body request
    const { username, email, password } = req.body;
    //cek apakah username atau email sudah terdaftar
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      });
    }
    //buat user baru
    const user = await User.create({
      username,
      email,
      password,
      role: 'user',
    });
    //generate token untuk user baru
    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refresh_token: refreshToken });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};
//controller untuk login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    //cari user berdasarkan username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    //cek apakah user aktif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }
    //cek password dengan method comparePassword di model User
    const isValidPassword = await user.comparePassword(password);
    //jika password tidak valid
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    //generate token dengan fungsi generateTokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Ensure user has an API key (for legacy users)
    if (!user.apiKey) {
      const apiKey = crypto.randomBytes(32).toString('hex');
      await user.update({ refresh_token: refreshToken, apiKey: apiKey });
      // Refresh user instance to include apiKey in toJSON
      user.apiKey = apiKey;
    } else {
      await user.update({ refresh_token: refreshToken });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

//controller untuk refresh token
exports.refreshToken = async (req, res) => {
  try {
    //dapatkan user dari database berdasarkan id dari req.user (setelah middleware auth memverifikasi token)
    const user = await User.findByPk(req.user.id);
    //generate token baru
    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refresh_token: refreshToken });
    //kirim response
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
};
//controller untuk logout
exports.logout = async (req, res) => {
  try {
    await User.update(
      { refresh_token: null },
      { where: { id: req.user.id } }
    );
    //kirim response
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

//controller untuk mendapatkan profile user
exports.getProfile = async (req, res) => {
  try {
    //dapatkan user dari database berdasarkan id dari req.user (setelah middleware auth memverifikasi token)
    const user = await User.findByPk(req.user.id);
    //kirim response
    res.json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message,
    });
  }
};