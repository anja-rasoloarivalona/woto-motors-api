const express = require('express');
const router = express.Router();

const statsController = require('../controllers/stats');


router.get('/notifications', statsController.getNotifications);

router.get('/products-stats', statsController.getProductsStats);

router.get('/user-connection-stats', statsController.getUserConnectionStats);

router.post('/add-notification/:userId', statsController.addANotification);


module.exports = router;