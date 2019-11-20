const express = require('express');
const router = express.Router();

const suppliersController = require('../controllers/suppliers');

router.get('/', suppliersController.getSuppliers);

router.post('/add-supplier', suppliersController.addSupplier)

router.put('/edit-supplier', suppliersController.editSupplier)


module.exports = router;