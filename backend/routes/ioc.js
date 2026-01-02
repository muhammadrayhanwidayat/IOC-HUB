const express = require('express');
const router = express.Router();
const iocController = require('../controllers/iocController');
const { verifyAccessToken } = require('../middleware/auth');
const { isAdmin, isUser } = require('../middleware/roleCheck');

router.use(verifyAccessToken);

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

// Stats (admin or user)
router.get('/stats', isUser, iocController.getStatistics);

module.exports = router;
