const Product = require('../models/product');
const Admin = require('../models/admin');
const User = require('../models/user');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')


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
            mainImgUrl: mainImgUrl,
            publicity: req.body.publicity,
            homePage: req.body.homePage
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

        stats: [{
            viewCounter: 0
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


exports.updateProduct = (req, res, next) => {
    console.log('updating')


    const ID = mongoose.Types.ObjectId(req.body.productBeingEditedID);

    let imageUrlsString = req.body.imageUrls;
    let featuresString = req.body.features;

    
    let imageUrlsArray = imageUrlsString.split(',');
    let featuresArray = featuresString.split(',');

    let mainImgUrl = imageUrlsArray[0];

    Product.findById(ID)
        .then(product => {
            if(!product){
                const error = new Error('Could not find product')
                error.statusCode = 404;
                throw error
            }

            product.general[0].title = req.body.title;
            product.general[0].made = req.body.made;
            product.general[0].model = req.body.model;
            product.general[0].year = req.body.year;
            product.general[0].price = req.body.price;
            product.general[0].nbKilometers = req.body.nbKilometers;
            product.general[0].gazol = req.body.gazol;
            product.general[0].yearOfRelease = req.body.yearOfRelease;
            product.general[0].transmissionType = req.body.transmissionType;
            product.general[0].nbOwners = req.body.nbOwners;
            product.general[0].serialNumber = req.body.serialNumber;
            product.general[0].generalState = req.body.generalState;
            product.general[0].publicity = req.body.publicity;
            product.general[0].homePage = req.body.homePage;

            product.general[0].mainImgUrl = mainImgUrl;


           product.tech[0].nbGearRatios = req.body.nbGearRatios;
           product.tech[0].nbCylinders = req.body.nbCylinders;
           product.tech[0].motorSize = req.body.motorSize;
           product.tech[0].maxSpeed = req.body.maxSpeed;


           product.design[0].intColor = req.body.intColor;
           product.design[0].extColor = req.body.extColor;

           product.features = featuresArray;
           product.imageUrls = imageUrlsArray;

           product.albumId = req.body.albumId;




            return product.save()
        })
        .then( result => {
            res.status(200).json({
                message: 'Product updated',
                product: result
            })
        })
        .catch(err => {
            console.log(err)
        })

        

        

}




exports.adminSignup = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log('error', errors);

        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error
    }


    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    const superAdmin = true;

    bcrypt.hash( password, 12)
          .then(encryptedPassword => {

              const admin = new Admin({
                  email: email,
                  firstName: firstName,
                  lastName: lastName,
                  password: encryptedPassword,
                  superAdmin: superAdmin
              })

              return admin.save()
          })
          .then( result => {
              res.status(201)
              .json({ message: 'Admin created',
                     adminId: result._id})
          })
          .catch( err => {
              if(!err.statusCode){
                  err.statusCode = 500
              }

              console.log(err)
          })
}

exports.adminLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;


    let adminAskingLogin;

    Admin.findOne({ email: email})
        .then( admin => {
            if(!admin){
                const error = new Error('An admin with this email could not be found');
                error.statusCode = 401;
                throw error
            }

            adminAskingLogin = admin;

            return bcrypt.compare(password, admin.password)
        })
        .then(isEqual => {
            if(!isEqual){
                const error = new Error('wrong password')
                error.statusCode = 401;
                throw error
            }

            const token = jwt.sign({
                email: adminAskingLogin.email,
                adminId: adminAskingLogin._id.toString()
            },
            'PkItj7221YGJbcsaYIL90!lmfds?mPdlf21l32nfe9',
            { expiresIn: '24h'});

            res.status(200).json({
                token: token,
                adminId: adminAskingLogin._id.toString(),
                adminName: `${adminAskingLogin.firstName} ${adminAskingLogin.lastName}`
            })
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500
            }

            console.log(err)
        })
}

exports.getUsers = (req, res, next ) => {
    User
    .find()
    .select('email firstName lastName _id active')
    .slice('connection', -1)
    .then(users => {
        res
          .status(200)
          .json({ message: 'Fetched users', users: users})
    })
    .catch(err => {
        console.log(err)
    })
}