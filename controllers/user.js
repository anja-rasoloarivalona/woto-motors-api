const mongoose = require('mongoose');
const Product = require('../models/product');

exports.getHomeProducts = (req, res, next) => {

    let publicityProducts;
    let homeInventoryProducts;


    Product
      .find({
          "general.publicity" : "oui"
      })
      .select('general')
      .then(products => {
        publicityProducts = products;

        Product.find({
            "general.homePage" : "oui"
        })
        .select('general')
        .then(homePageProducts => {
            homeInventoryProducts = homePageProducts;

    res
        .status(200)
        .json({ message: 'Fetched user products', 
                publicityProducts: publicityProducts,
                homeInventoryProducts: homeInventoryProducts})
        })
  
      })
      .catch(err => {
        console.log(err)
    })
} 

exports.getProduct = (req, res, next ) => {   
    const id= mongoose.Types.ObjectId(req.params.prodId);
    Product
        .findById(id)
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