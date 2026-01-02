const express = require('express');//import express
const router = express.Router();//import router dari express
const urlhausController = require('../controllers/urlhausController');//import controller URLhaus
const { verifyAccessToken } = require('../middleware/auth');//import middleware auth
const { isAdmin, isUser } = require('../middleware/roleCheck');//import middleware roleCheck

router.use(verifyAccessToken);//use middleware auth untuk semua route di file ini

//define route untuk URLhaus

router.get('/sync/urls', isAdmin, urlhausController.syncRecentURLs);
router.get('/sync/payloads', isAdmin, urlhausController.syncRecentPayloads);
router.post('/query/url', isUser, urlhausController.queryURL);
router.post('/query/host', isUser, urlhausController.queryHost);
router.post('/query/payload', isUser, urlhausController.queryPayload);
router.post('/query/tag', isUser, urlhausController.queryTag);

//export router
module.exports = router;