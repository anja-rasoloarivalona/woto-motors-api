const express = require('express');
const userController = require('../controllers/user');



const router = express.Router();


router.get('/home-products', userController.getHomeProducts)

router.get('/:prodId', userController.getProduct)


module.exports = router;