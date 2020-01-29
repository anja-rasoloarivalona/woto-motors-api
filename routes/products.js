const express = require('express');
const productsController = require('../controllers/products');
const router = express.Router();

router.get('/client', productsController.getProductsAsClient);
router.get('/admin', productsController.getProductsAsAdmin);


router.get('/init', productsController.initAppDatas);
router.get('/publicity', productsController.getProductPublicity)

router.get('/:prodId', productsController.getProduct);



module.exports = router