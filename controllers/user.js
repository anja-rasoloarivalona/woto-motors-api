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