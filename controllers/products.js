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

    let madeRequested = 'Toyota'
    let modelRequested = 'Elantra'
    let priceRequested = 2000
    const {made, model, price, } = req.query;


    

    if(made !== 'null'){
        madeRequested = made
    } 
    if(model !== 'null'){
        modelRequested = model
    }
    if(price !== 'null'){
        priceRequested = price
    } 

    console.log('made requested', madeRequested)

    

    const prodId = mongoose.Types.ObjectId(req.params.prodId);

    console.log('prodId', prodId)

    Product
        .find({   $or: [{_id: prodId}, {'general.made' : madeRequested}] })

        .then(products => {

            
            if(!products){
                const error = new Error('Product not found');
                error.statusCode = 404
                throw error
            }

            console.log(products)

            let requestedProduct = products.find(product => product._id.toString() === prodId.toString())
            let relatedProducts = products.filter(product => product._id.toString() !== prodId.toString())

            console.log('requested', requestedProduct)

            res.status(200).json({
                message: 'Product fetched',
                product: requestedProduct,
                relatedProducts: relatedProducts
            })
        })
        .catch(err => {
            console.log(err)
        })
}