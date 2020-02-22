const mongoose = require('mongoose');
const Product = require('../models/product');
const Supplier = require('../models/supplier');

exports.initAdminApp = (req, res, next) => {

    let suppliersData;
    let brandAndModelsData = {};
    let bodyTypeList = [];

    let price = {
        min: null,
        max: null
    }

    Supplier
        .find()
        .then(suppliers => {
            if(!suppliers){
                const error = new Error('Could not fetch suppliers');
                error.statusCode = 401;
                throw error
            }
            suppliersData = suppliers
            return Product.find()
        })
        .then(products => {
            if(!products){
                const error = new Error('Could not fetch products');
                error.statusCode = 401;
                throw error
            }

            price = {
                min: products[0].general.price,
                max: products[0].general.price,
            }

            products.forEach(product => { 
                let brand = product.general.brand
                let model  = product.general.model
                let bodyType = product.general.bodyType     

                //Set min and max price
                if(product.general.price < price.min){
                    price = {
                        ...price,
                        min: product.general.price
                    }
                }
                if(product.general.price > price.max){
                    price = {
                        ...price,
                        max: product.general.price
                    }
                }

                //Set body type list
                if(!bodyTypeList.includes(bodyType)){
                    bodyTypeList.push(bodyType)
                }

                if(!Object.keys(brandAndModelsData).includes(brand)){
                    //The current brand is not in the data set yet
                    brandAndModelsData = {
                        ...brandAndModelsData,
                        [brand]: {
                            [bodyType]: [model]
                        }
                    }
    
                } else {      
                    //The current brand is already in the data set
                    if(!Object.keys(brandAndModelsData[brand]).includes(bodyType)){
                        //the body type is not yet in the brand data
                            brandAndModelsData = {
                                ...brandAndModelsData,
                                [brand]: {
                                    ...brandAndModelsData[brand],
                                    [bodyType]: [model]
                                }
                            }                   
                        } else {
                            //the body type is alrady in the brand data
                            if(!brandAndModelsData[brand][bodyType].includes(model)){
                                //the model is not in the body type yet
                                brandAndModelsData = {
                                    ...brandAndModelsData,
                                    [brand]: {
                                        ...brandAndModelsData[brand],
                                        [bodyType]: [...brandAndModelsData[brand][bodyType], model]
                                    }
                                } 
                            }
                        }
                } 

            })      

            res
                .status(200)
                .json({
                    message: 'Init data fetched',
                    totalProducts: products.length,
                    suppliers: suppliersData,
                    brandAndModelsData: brandAndModelsData,
                    bodyTypeList: bodyTypeList,
                    price: price,
                })
        })
        .catch(err => {
            console.log(err)
        })
}