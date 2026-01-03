const express = require('express');//import express
const router = express.Router();//import router dari express
//import controller ioc untuk menghandle request IOC
const iocController = require('../controllers/iocController');
//import middleware auth untuk verifikasi token(verifyAccessToken)
const { verifyAccessToken } = require('../middleware/auth');
//import middleware roleCheck untuk pengecekan role (isAdmin, isUser)
const { isAdmin, isUser } = require('../middleware/roleCheck');

//gunakan middleware auth untuk semua route di file ini
router.use(verifyAccessToken);

// Stats (admin or user)
router.get('/stats', isUser, iocController.getStatistics);


// GET list (user & admin)
router.get('/', isUser, iocController.getAllIOCs);


// GET detail
router.get('/:id', isUser, iocController.getIOCById);

// POST create (admin only)
router.post('/', isAdmin, iocController.createIOC);

// PUT update (admin only)
router.put('/:id', isAdmin, iocController.updateIOC);

// DELETE (admin only)
router.delete('/:id', isAdmin, iocController.deleteIOC);



module.exports = router;
