const express = require('express');
var router = express.Router();

const controller = require('../controllers/index.controller');

router.get('/', controller.get);
router.get('/update/:secretKey', controller.getUpdate);

module.exports = router;