const mongoose = require('mongoose');
const Product = require('../models/product');
const Supplier = require('../models/supplier');

exports.initAdminApp = (req, res, next) => {
    let suppliersData;
    let brandsAndModels = {};
    
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

            products.forEach(product => {
    
                let brand = product.general.brand
                let model  = product.general.model
                let price = product.general.price
                let year = parseInt(product.general.year) 
    
                let modelsData = {
                    [model]: {
                        minPrice: price,
                        maxPrice: price,
                        minYear: year,
                        maxYear: year
                    }
                }
                if(!Object.keys(brandsAndModels).includes(brand)){
                    //Add a new brand array in the keys array
                    brandsAndModels = {
                        ...brandsAndModels,
                        [brand]: {
                            price: {
                                min: price,
                                max: price
                            },
                            year: {
                                min: year,
                                max: year
                            },
                            datas: {
                                ...modelsData
                            }
                        }
                    }
    
                } else {
                    //brand array already exist so we have 2 possiblities
                
                    if(brandsAndModels[brand].datas[model] !== undefined){
                         //1st case : the brand array already contains the model of the current product
                        let modelData = brandsAndModels[brand].datas[model];
    
                        if(modelData.minPrice > price){
                            brandsAndModels[brand].datas[model].minPrice = price
                        }
    
                        if(modelData. maxPrice < price){
                            brandsAndModels[brand].datas[model].maxPrice = price
                        }

                        if(modelData.minYear > year){
                            brandsAndModels[brand].datas[model].minYear = year
                        }

                        if(modelData. maxYear < year){
                            brandsAndModels[brand].datas[model].maxYear = year
                        }
       
                    } else {
                        //2nd case : the brand array doesn't contain the model of the current product
                        brandsAndModels = {
                            ...brandsAndModels,
                            [brand]:{
                                ...brandsAndModels[brand],
                                datas: {
                                    ...brandsAndModels[brand].datas,
                                    ...modelsData
                                }        
                            }
                        }
                    }
                }
    
                if(brandsAndModels[brand].price.min > price){
                    brandsAndModels[brand].price.min = price
                }
    
                if(brandsAndModels[brand].price.max < price){
                    brandsAndModels[brand].price.max = price
                }

                if(brandsAndModels[brand].year.min > year){
                    brandsAndModels[brand].year.min = year
                }

                if(brandsAndModels[brand].year.max < year){
                    brandsAndModels[brand].year.max = year
                }
            })      

            res
                .status(200)
                .json({
                    message: 'Init data fetched',
                    suppliers: suppliersData,
                    brandsAndModels: brandsAndModels,
                    totalProducts: products.length
                })
        })
        .catch(err => {
            console.log(err)
        })
}