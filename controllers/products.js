const Product = require('../models/product');
const mongoose = require('mongoose')

exports.initAppDatas = (req, res, next) => {
    
    let publicityProducts = [];
    let homeInventoryProducts = [];
    let madeAndModelsData = {};
    let keys = []

    Product
      .find()
      .select('general')
      .then(products => {

        console.log('products', products)

        products.forEach(product => {

            if(product.general[0].publicity === 'oui'){
                publicityProducts.push(product)
            }

            if(product.general[0].homePage === 'oui'){
                homeInventoryProducts.push(product)
            }

            let made = product.general[0].made
            let model  = product.general[0].model
            let price = product.general[0].price

            let modelsData = {
                [model]: {
                    min: price,
                    max: price
                }
            }
     
            if(!keys.includes(made)){

                //Add a new made array in the keys array
                madeAndModelsData = {
                    ...madeAndModelsData,
                    [made]: {
                        price: {
                            min: price,
                            max: price
                        },
                        datas: {
                            ...modelsData
                        }
                    }
                }
                keys = Object.keys(madeAndModelsData)

            } else {
                //made array already exist so we have 2 possiblities
            
                if(madeAndModelsData[made].datas[model] !== undefined){
                     //1st case : the made array already contains the model of the current product
                    let modelPrice = madeAndModelsData[made].datas[model];

                    if(modelPrice.min > price){
                     
                        madeAndModelsData[made].datas[model].min = price
                    }

                    if(modelPrice.max < price){
                        madeAndModelsData[made].datas[model].max = price
                    }


                } else {
                    //2nd case : the made array doesn't contain the model of the current product
                    madeAndModelsData = {
                        ...madeAndModelsData,
                        [made]:{
                            ...madeAndModelsData[made],
                            datas: {
                                ...madeAndModelsData[made].datas,
                                ...modelsData
                            }        
                        }
                    }
                }
            }

            if(madeAndModelsData[made].price.min > price){
                madeAndModelsData[made].price.min = price
            }

            if(madeAndModelsData[made].price.max < price){
                madeAndModelsData[made].price.max = price
            }
           
        })
        res
            .status(200)
            .json({ message: 'Fetched user products', 
                publicityProducts: publicityProducts,
                homeInventoryProducts: homeInventoryProducts,
                madeAndModelsData: madeAndModelsData})
        })
        .catch(err => {
            console.log(err)
        })
        
}

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

    const prodId = mongoose.Types.ObjectId(req.params.prodId);
    Product
        .find({   $or: [{_id: prodId}, {'general.made' : madeRequested}] })
        .then(products => {       
            if(!products){
                const error = new Error('Product not found');
                error.statusCode = 404
                throw error
            }
            let requestedProduct = products.find(product => product._id.toString() === prodId.toString())
            let relatedProducts = products.filter(product => product._id.toString() !== prodId.toString())

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


