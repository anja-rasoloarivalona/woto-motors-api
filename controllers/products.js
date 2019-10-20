const Product = require('../models/product');
const mongoose = require('mongoose')

exports.getProducts = (req, res, next ) => {
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

exports.getProduct = (req, res, next) => {
    const prodId = mongoose.Types.ObjectId(req.params.prodId);
    Product
        .findById(prodId)
        .then(product => {
            if(!product){
                const error = new Error('Product not found');
                error.statusCode = 404
                throw error
            }

            res.status(200).json({
                message: 'Product fetched',
                product: product
            })
        })
        .catch(err => {
            console.log(err)
        })
}