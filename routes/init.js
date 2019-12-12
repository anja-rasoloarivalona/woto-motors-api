const express = require('express');
const router = express.Router();

const initController = require('../controllers/init');


router.get('/', initController.initAdminApp)


module.exports = router