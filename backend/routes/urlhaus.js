const express = require('express');
const router = express.Router();
const urlhausController = require('../controllers/urlhausController');
const { verifyAccessToken } = require('../middleware/auth');
const { isAdmin, isUser } = require('../middleware/roleCheck');

router.use(verifyAccessToken);

router.get('/sync/urls', isAdmin, urlhausController.syncRecentURLs);
router.get('/sync/payloads', isAdmin, urlhausController.syncRecentPayloads);
router.post('/query/url', isUser, urlhausController.queryURL);
router.post('/query/host', isUser, urlhausController.queryHost);
router.post('/query/payload', isUser, urlhausController.queryPayload);
router.post('/query/tag', isUser, urlhausController.queryTag);

module.exports = router;