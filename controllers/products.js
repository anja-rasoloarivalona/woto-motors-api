const Product = require('../models/product');
const mongoose = require('mongoose');
const User = require('../models/user')
const timeStampGenerator = require('../utilities/timeStampGenerator')

exports.initAppDatas = (req, res, next) => {
    
    let publicityProducts = [];
    let homeInventoryProducts = [];
    let mostPopularProducts = [];

    let madeAndModelsData = {};
    let keys = []

    Product
      .find()
      .select('general')
      .sort({'general.viewCounter': -1})
      .then(products => {

        mostPopularProducts = products.slice(0, 4)

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
                madeAndModelsData: madeAndModelsData,
                mostPopularProducts: mostPopularProducts})
        })
        .catch(err => {
            console.log(err)
        })
        
}

exports.getProducts = (req, res, next ) => {
    let madeQueries = [],
        priceQueries,
        yearQueries

    if(req.query.price === 'undefined'){
        priceQueries = {"general.price" : { $ne: null}}
    } else {
        let minPrice = req.query.price.split(':')[0]
        let maxPrice = req.query.price.split(':')[1];
        priceQueries={ "general.price" : { $gte: minPrice, $lte: maxPrice} }
    }


    if(req.query.year === 'undefined'){
        yearQueries = {"general.year" : { $ne: null}}
    } else {
        let minYear = req.query.year.split(':')[0]
        let maxYear = req.query.year.split(':')[1];
        yearQueries ={ "general.year" : { $gte: minYear, $lte: maxYear} }
    }

    

    let mades
    let datas = {};

    if(req.query.made === 'undefined' || req.query.made === 'all'){
        madeQueries = [{ "general.made" : { $ne: null}}]
    } else {
        mades = req.query.made.split('_');

        mades.forEach( i => {
            if(i !== ''){        
                let made = i.split(':')[0]
                let madeData = i.split(':')[1].split(',')
    
                datas[made] = madeData
            }
        })

        Object.keys(datas).map( made => {
            datas[made].forEach(model => {
                let sort; 
                if(model !== 'all'){
                    sort = {
                        "general.made": made,
                        "general.model": model
                    }
                } else {
                    sort = {
                        "general.made": made,
                    }
                }
                madeQueries = [...madeQueries, sort]
            })
            
        })
    }

    const { sortBy } = req.query;

    let sort;

    if(sortBy === 'undefined' ||sortBy === 'prix croissant' ){
        sort = {"general.price": 1};
    }

    if(sortBy === 'prix décroissant'){
        sort = {"general.price": -1};
    }

    if(sortBy === 'popularité'){
        sort = {"general.viewCounter": -1};
    }

    if(sortBy === 'date'){
        sort = {createdAt: -1};
    }


    Product
        .find({ 
            $and: [
               {$or: madeQueries},
                priceQueries,
                yearQueries
            ]
        })
        .select('general _id createdAt')
        .sort(sort)
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
    const {made, model, price, userId} = req.query;

    let userIdMakingRequest = userId;
    let productsResponse;
    let timestamp = timeStampGenerator()

    if(userId !== 'not connected') {
        userIdMakingRequest = mongoose.Types.ObjectId(userId)
    }

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

            productsResponse = products;

            

            products.forEach(product => {

              if(product._id.toString() === prodId.toString()){
                  let viewCounter = product.general[0].viewCounter;
                  if(viewCounter === undefined){
                     product.general[0].viewCounter = 1
                  } else {
                    product.general[0].viewCounter = product.general[0].viewCounter + 1
                  }

                  product.views = [...product.views, {
                      userId: userIdMakingRequest,
                      timeStamp: timestamp
                  }]

                  return product.save()
                }
            })
        })
        .then(() =>{

            let requestedProduct = productsResponse.find(product => product._id.toString() === prodId.toString())
            let relatedProducts = productsResponse.filter(product => product._id.toString() !== prodId.toString())

            res.status(200).json({
                message: 'Product fetched',
                product: requestedProduct,
                relatedProducts: relatedProducts
            })

            if(userId !== 'not connected'){
                addingViewsToUser(userIdMakingRequest, prodId, timestamp);
            }

            
            console.log('res send')

           

        })           
        .catch(err => {
            console.log(err)
        })
}


const addingViewsToUser = (userId, prodId, timeStamp) => {
    User.findById(userId)
        .then(user => {

            user.views = [...user.views, {
                productId: prodId,
                timeStamp: timeStamp
            }]

            return user.save()
        })
        .catch(err => {
            console.log(err)
        })
}


