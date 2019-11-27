const express = require('express');
const router = express.Router();

const suppliersController = require('../controllers/suppliers');

router.get('/', suppliersController.getSuppliers);

router.post('/add-supplier', suppliersController.addSupplier)

router.put('/edit-supplier', suppliersController.editSupplier)

router.delete('/delete-supplier/:supplierId', suppliersController.deleteSUpplier);

module.exports = router;