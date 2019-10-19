const Product = require('../models/product');

exports.getProducts = (req, res, next ) => {

    console.log('get products');

    
    Product
        .find()
        .select('general _id')
        .then(products => {
            res
                .status(200)
                .json({ message: 'Products feteched', products: products})
        })
        .catch( err => {
            console.log(err)
        })
}