const express = require('express');
const userController = require('../controllers/user');



const router = express.Router();


router.get('/home-products', userController.getHomeProducts)


module.exports = router;