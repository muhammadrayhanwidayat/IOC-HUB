//khusus CRUD + statistik IOC
const { IOC } = require('../models');//import model IOC
const { Op } = require('sequelize');//import operator sequelize

//controller untuk mendapatkan semua IOC dengan pagination, filter, dan sorting
exports.getAllIOCs = async (req, res) => {
  try {
    //dapatkan query parameters
    const { 
      page = 1, 
      limit = 50, 
      type, 
      status, 
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    //hitung offset untuk pagination page 1 = 0, page 2 = 50, dst
    const offset = (page - 1) * limit;
    //objek where untuk filter
    const where = {};
    //tambahkan filter
    if (type) where.type = type;
    if (status) where.status = status;
    //tambahkan pencarian di value, threat, dan reporter
    if (search) {
      where[Op.or] = [
        { value: { [Op.like]: `%${search}%` } },
        { threat: { [Op.like]: `%${search}%` } },
        { reporter: { [Op.like]: `%${search}%` } },
      ];
    }
    //dapatkan data dengan pagination, filter, dan sorting dari database(findAndCountAll dari sequelize)
    const { count, rows } = await IOC.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder]],
    });
    //kirim response
    res.json({
      success: true,
      data: {
        iocs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all IOCs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch IOCs',
      error: error.message,
    });
  }
};

//controller untuk mendapatkan IOC berdasarkan ID
exports.getIOCById = async (req, res) => {
  try {
    const { id } = req.params;
    const ioc = await IOC.findByPk(id);

    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: 'IOC not found',
      });
    }

    res.json({
      success: true,
      data: ioc,
    });
  } catch (error) {
    console.error('Get IOC by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch IOC',
      error: error.message,
    });
  }
};

//controller untuk membuat IOC baru
exports.createIOC = async (req, res) => {
  try {
    const iocData = req.body;
    const ioc = await IOC.create(iocData);

    res.status(201).json({
      success: true,
      message: 'IOC created successfully',
      data: ioc,
    });
  } catch (error) {
    console.error('Create IOC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create IOC',
      error: error.message,
    });
  }
};

//controller untuk memperbarui IOC berdasarkan ID
exports.updateIOC = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ioc = await IOC.findByPk(id);
    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: 'IOC not found',
      });
    }

    await ioc.update(updateData);

    res.json({
      success: true,
      message: 'IOC updated successfully',
      data: ioc,
    });
  } catch (error) {
    console.error('Update IOC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update IOC',
      error: error.message,
    });
  }
};

//controller untuk menghapus IOC berdasarkan ID
exports.deleteIOC = async (req, res) => {
  try {
    const { id } = req.params;

    const ioc = await IOC.findByPk(id);
    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: 'IOC not found',
      });
    }

    await ioc.destroy();

    res.json({
      success: true,
      message: 'IOC deleted successfully',
    });
  } catch (error) {
    console.error('Delete IOC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete IOC',
      error: error.message,
    });
  }
};

//controller untuk mendapatkan statistik IOC
exports.getStatistics = async (req, res) => {
  try {
    //hitung total IOC, IOC berdasarkan tipe, status, dan threat
    const totalIOCs = await IOC.count();
    const byType = await IOC.findAll({
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', 'type'), 'count'],
      ],
      group: ['type'],
    });

    const byStatus = await IOC.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', 'status'), 'count'],
      ],
      group: ['status'],
    });

    const byThreat = await IOC.findAll({
      attributes: [
        'threat',
        [require('sequelize').fn('COUNT', 'threat'), 'count'],
      ],
      group: ['threat'],
      limit: 10,
    });
    //kirim response
    res.json({
      success: true,
      data: {
        total: totalIOCs,
        byType: byType.map(item => ({
          type: item.type,
          count: parseInt(item.get('count')),
        })),
        byStatus: byStatus.map(item => ({
          status: item.status,
          count: parseInt(item.get('count')),
        })),
        byThreat: byThreat.map(item => ({
          threat: item.threat,
          count: parseInt(item.get('count')),
        })),
      },
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};