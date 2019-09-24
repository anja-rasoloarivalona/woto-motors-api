const Product = require('../models/product');


exports.addProduct = (req, res, next) => {
    console.log('adding...');


    let imageUrlsString = req.body.imageUrls;
    let featuresString = req.body.features;

    
    let imageUrlsArray = imageUrlsString.split(',');
    let featuresArray = featuresString.split(',');


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
            nbOwners: req.body.nbOwners,
            serialNumber: req.body.serialNumber,
            generalState: req.body.generalState
        }],

        tech: [{
            nbGearRatios: req.body.nbGearRatios,
            nbCylindres: req.body.nbCylinders,
            motorSize: req.body.motorSize,
            maxSpeed: req.body.maxSpeed,
        }],

        design: [{
            intColor: req.body.intColor,
            extColor: req.body.extColor
        }],

        features: featuresArray, 
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