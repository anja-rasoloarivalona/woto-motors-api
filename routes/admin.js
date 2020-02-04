const express = require('express');
const router = express.Router();
const {body } = require('express-validator')


const adminController = require('../controllers/admin');
const Admin = require('../models/admin');




router.get('/products', adminController.getProducts);
router.get('/connected-users', adminController.getConnectedUsers);

router.get('/publicity', adminController.getProductsPublicity);


router.get('/user/:userId', adminController.getUser)
router.get('/:prodId', adminController.getProduct)

router.post('/users', adminController.getUsers);

router.post('/publicity/add-new', adminController.getProductsToBeAddedToPublicity)
router.post('/add-product', adminController.addProduct);
router.post('/login', adminController.adminLogin);

router.put('/edit-product', adminController.updateProduct);
router.put('/update-product-visibility', adminController.updateProductsVisibility)
router.put('/signup', 

[
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return Admin.findOne({ email: value })
                .then( adminDoc => {
                    if (adminDoc) {
                        return Promise.reject('E-Mail address already exists!');
                    }
                })
         
      })
      .normalizeEmail(),

    body('password')
      .trim()
      .isLength({ min: 5 }),


    body('firstName')
      .trim()
      .not()
      .isEmpty(),

      body('lastName')
      .trim()
      .not()
      .isEmpty(),


  ], 
  adminController.adminSignup)


  


module.exports = router;




