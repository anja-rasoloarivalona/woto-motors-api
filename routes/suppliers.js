const express = require('express');
const router = express.Router();

const suppliersController = require('../controllers/suppliers');


router.post('/add-supplier', suppliersController.addSupplier)


module.exports = router;