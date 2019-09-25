const Product = require('../models/product');
const mongoose = require('mongoose')


exports.getProducts = (req, res, next) => {
    Product
        .find()
        .select('general _id')
        .then(products => {
            res
              .status(200)
              .json({ message: 'Fetched admin products', products: products})
        })
        .catch(err => {
            console.log(err)
        })
}


exports.getProduct = (req, res, next ) => {   
    const ID = mongoose.Types.ObjectId(req.params.prodId);
    Product
        .findById(ID)
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



exports.addProduct = (req, res, next) => {
    console.log('adding...');


    let imageUrlsString = req.body.imageUrls;
    let featuresString = req.body.features;

    
    let imageUrlsArray = imageUrlsString.split(',');
    let featuresArray = featuresString.split(',');

    let mainImgUrl = imageUrlsArray[0];

    const product = new Product({
        general: [{
            title: req.body.title,
            made: req.body.made,
            model: req.body.model,
            year: req.body.year,
            price: req.body.price,
            nbKilometers: req.body.nbKilometers,
            gazol: req.body.gazol,
            yearOfRelease: req.body.yearOfRelease,
            transmissionType: req.body.transmissionType,
            nbOwners: req.body.nbOwners,
            serialNumber: req.body.serialNumber,
            generalState: req.body.generalState,
            mainImgUrl: mainImgUrl
        }],

        tech: [{
            nbGearRatios: req.body.nbGearRatios,
            nbCylinders: req.body.nbCylinders,
            motorSize: req.body.motorSize,
            maxSpeed: req.body.maxSpeed,
        }],

        design: [{
            intColor: req.body.intColor,
            extColor: req.body.extColor
        }],

        features: featuresArray, 
        albumId: req.body.albumId,
        imageUrls: imageUrlsArray
    })


    product
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Product created successfully!',
                product: product
            })
        }) 
        .catch(err => {
            console.log(err)
        })

}