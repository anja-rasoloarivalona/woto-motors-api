const Product = require('../models/product');
const mongoose = require('mongoose');
const User = require('../models/user')
const timeStampGenerator = require('../utilities/timeStampGenerator')

exports.initAppDatas = (req, res, next) => {
    let publicityProducts = [];
    let homeInventoryProducts = [];
    let mostPopularProducts = [];
    let mostPopularSedan = [];

    let brandAndModelsData = {};
    let bodyTypeList = [];
    let totalProductsCounter;
    let price = {
        min: null,
        max: null
    }
    Product
      .find()
      .select('general')
      .sort({'general.viewCounter': -1})
      .then(products => {
        totalProductsCounter = products.length
        price = {
            min: products[0].general.price,
            max: products[0].general.price,
        }
        //Setting most popular products
        mostPopularProducts = products.slice(0, 4);
        
        let sedanCounter = 0

        products.forEach(product => {
            //Setting publicity products
            if(product.general.publicity){
                publicityProducts.push(product)
            }
            //Setting home Page products
            if(product.general.homePage){
                homeInventoryProducts.push(product)
            }
            //Setting most popular sedans
            if(product.general.bodyType === 'sedan' && sedanCounter < 4){
                mostPopularSedan.push(product)
                sedanCounter++
            }
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
            if(!bodyTypeList.includes(product.general.bodyType)){
                bodyTypeList.push(product.general.bodyType)
            }

            let brand = product.general.brand
            let model  = product.general.model
            let bodyType = product.general.bodyType


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
            .json({ message: 'Fetched user products', 
                publicityProducts: publicityProducts,
                homeInventoryProducts: homeInventoryProducts,
                brandAndModelsData: brandAndModelsData,
                mostPopularProducts: mostPopularProducts,
                mostPopularSedan:  mostPopularSedan,
                bodyTypeList: bodyTypeList,
                price: price,
                totalProductsCounter: totalProductsCounter
               })
        })
        .catch(err => {
            console.log(err)
        })
        
}

exports.getProductsAsClient = (req, res, next ) => {
    let minPriceQueries,
        maxPriceQueries, 
        minYearQueries,
        maxYearQueries,
        brandQueries,
        bodyTypeQueries,
        modelQueries

        // ---- PRICE
        if(req.query.minPrice === 'undefined' || req.query.minPrice === undefined){
            minPriceQueries = {"general.price" : { $ne: null}}
        } else {
            minPriceQueries = { "general.price" : { $gte: req.query.minPrice} }
        }
    
        if(req.query.maxPrice === 'undefined' || req.query.maxPrice === undefined){
            maxPriceQueries = {"general.price" : { $ne: null}}
        } else {
            maxPriceQueries = { "general.price" : { $lte: req.query.maxPrice} }
        }

        // ---- YEAR
        if(req.query.minYear === 'undefined' || req.query.minYear === undefined){
            minYearQueries = {"general.year" : { $ne: null}}
        } else {
            minYearQueries = { "general.year" : { $gte: req.query.minYear} }
        }

        if(req.query.maxYear === 'undefined' || req.query.maxYear === undefined){
            maxYearQueries = {"general.year" : { $ne: null}}
        } else {
            maxYearQueries = { "general.year" : { $lte: req.query.maxYear} }
        }

        // --- BODY TYPE
        const {bodyType} = req.query;
        if(bodyType === 'undefined' || bodyType === undefined || bodyType === 'all'){
            bodyTypeQueries = { "general.bodyType" : { $ne: null}}
        } else {
            bodyTypeQueries = {'general.bodyType': bodyType}
        }

        // --- BRAND
        const {brand} = req.query;
        if(brand === 'undefined' || brand === undefined || brand === 'all'){
            brandQueries = { "general.brand" : { $ne: null}}
        } else {
            brandQueries = {'general.brand': brand}
        }

    
        // --- MODEL
        const {model} = req.query;
        if(model === 'undefined' || model === undefined || model === 'all'){
            modelQueries = { "general.model" : { $ne: null}}
        } else {
            modelQueries = {'general.model': model}
        }

        // ---- sort
        const { sort } = req.query;
        let sortBy;
        if(sort === 'undefined' || sort === 'increasing_price' ){
            sortBy = {"general.price": 1};
        }
        if(sort === 'decreasing_price'){
            sortBy = {"general.price": -1};
        }
        if(sort === 'latest'){
            sortBy = {"general.viewCounter": -1};
        }
        if(sort === 'most_popular'){
            sortBy = {createdAt: -1};
        }

        let findQuery = {
            $and: [
                bodyTypeQueries,
                brandQueries,
                modelQueries,
                minPriceQueries,
                maxPriceQueries,
                minYearQueries,
                maxYearQueries,
            ]
        }

    const currentPage = req.query.page || 1;
    const itemsPerPage = 20;

    Product
        .find(findQuery)
        .sort(sortBy)  
        .skip( (currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)  
        .then(products => {
            res
                .status(200)
                .json({ message: 'Products feteched', 
                        products: products,
                    })
        })
        .catch( err => {
            console.log(err)
        })
}

exports.getProductsAsAdmin = (req, res, next ) => {
    let brandQueries,
        minPriceQueries,
        maxPriceQueries,
        minYearQueries,
        maxYearQueries,
        modelQueries,
        supplierQuery,
        bodyTypeQueries

        const currentPage = req.query.page || 1;
        const itemsPerPage =20;

    // --- BODY TYPE
    const {bodyType} = req.query;
    if(bodyType === 'undefined' || bodyType === undefined || bodyType === 'all'){
        bodyTypeQueries = { "general.bodyType" : { $ne: null}}
    } else {
        bodyTypeQueries = {'general.bodyType': bodyType}
    }


       // ---- PRICE
       if(req.query.minPrice === 'undefined' || req.query.minPrice === undefined){
        minPriceQueries = {"general.price" : { $ne: null}}
    } else {
        minPriceQueries = { "general.price" : { $gte: req.query.minPrice} }
    }

    if(req.query.maxPrice === 'undefined' || req.query.maxPrice === undefined){
        maxPriceQueries = {"general.price" : { $ne: null}}
    } else {
        maxPriceQueries = { "general.price" : { $lte: req.query.maxPrice} }
    }


    //year 

    if(req.query.minYear === 'undefined' || req.query.minYear === undefined){
        minYearQueries = {"general.year" : { $ne: null}}
    } else {
        minYearQueries = { "general.year" : { $gte: req.query.minYear} }
    }

    if(req.query.maxYear === 'undefined' || req.query.maxYear === undefined){
        maxYearQueries = {"general.year" : { $ne: null}}
    } else {
        maxYearQueries = { "general.year" : { $lte: req.query.maxYear} }
    }

    const { supplierId } = req.query; 

    console.log('supplierId', supplierId )
    if(supplierId === 'undefined' || supplierId === undefined || supplierId === 'null' || supplierId === 'all'){
        supplierQuery = {'supplier.info' : {$ne: null}}
    } else {
        supplierQuery = {'supplier.info' : supplierId}
    }

    const {brand} = req.query;
    if(brand === 'undefined' || brand === undefined || brand === 'all'){
        brandQueries = { "general.brand" : { $ne: null}}
    } else {
        brandQueries = {'general.brand': brand}
    }

    const {model} = req.query;
    if(model === 'undefined' || model === undefined || model === 'all'){
        modelQueries = { "general.model" : { $ne: null}}
    } else {
        modelQueries = {'general.model': model}
    }


       // ---- sort
       const { sort } = req.query;
       let sortBy;
       if(sort === 'undefined' || sort === 'increasing_price' ){
           sortBy = {"general.price": 1};
       }
       if(sort === 'decreasing_price'){
           sortBy = {"general.price": -1};
       }
       if(sort === 'latest'){
           sortBy = {"general.viewCounter": -1};
       }
       if(sort === 'most_popular'){
           sortBy = {createdAt: -1};
       }


    let findQuery = {
        $and: [
            brandQueries,
            modelQueries,
            minPriceQueries,
            maxPriceQueries,
            minYearQueries,
            maxYearQueries,
            supplierQuery,
            bodyTypeQueries
        ]
    }

    let totalProducts;

    Product
        .find(findQuery)
        .then(products => {
            if(!products){
                const error = new Error('No Products Found')
                error.statusCode = 404
                throw error 
            }
            totalProducts = products.length;

            return Product.find(findQuery)
                .select('general _id createdAt supplier followers')
                .sort(sortBy)
                .skip( (currentPage - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .populate('supplier.info')
                .exec()  
        })
            
        .then(products => {
            res
                .status(200)
                .json({ message: 'Products feteched', 
                        products: products,
                        totalProducts: totalProducts
                    })
        })
        .catch( err => {
            console.log(err)
        })
}

exports.getProduct = (req, res, next) => {

    console.log('get product',req.query);

    let brandRequested = 'Toyota';
    let modelRequested = 'Elantra';
    let priceRequested = 2000


    const {brand, model, price, userId} = req.query;

    if(brand !== undefined || brand !== 'undefined'){
        brandRequested = brand
    }

    let userIdMakingRequest = userId;
    let productsResponse;
    let timestamp = timeStampGenerator();
    let requestedProduct, relatedProducts;

    if(userId !== 'not connected') {
        userIdMakingRequest = mongoose.Types.ObjectId(userId)
    }

    const prodId = mongoose.Types.ObjectId(req.params.prodId);

    Product
        .find({   $or: [ {_id: prodId}, {'general.brand': brandRequested} ] })
        .then(products => {       
            if(!products){
                const error = new Error('Product not found');
                error.statusCode = 404
                throw error
            }
            productsResponse = products;            
            products.forEach(product => {

              if(product._id.toString() === prodId.toString()){
                  let viewCounter = product.general.viewCounter;
                  if(viewCounter === undefined){
                     product.general.viewCounter = 1
                  } else {
                    product.general.viewCounter = product.general.viewCounter + 1
                  }

                  product.views = [...product.views, {
                      userId: userIdMakingRequest,
                      timeStamp: timestamp
                  }]

                  return product.save()
                }
            })
        })
        .then( () => { 
           requestedProduct = productsResponse.find(product => product._id.toString() === prodId.toString())
            if(userId !== 'not connected'){
                addingViewsToUser(userIdMakingRequest, prodId, timestamp);
            }    

           relatedProducts = productsResponse.filter(product => product._id.toString() !== prodId.toString())

            if(relatedProducts < 1){

                Product
                    .find()
                    .then(products => {
                        let moreProducts = products.slice(0, 3);
                        moreProducts.forEach(product => {
                            relatedProducts = [...relatedProducts, product]
                        })  
                        res.status(200).json({
                            message: 'Product fetched',
                            product: requestedProduct,
                            relatedProducts: relatedProducts,
                        })    
                    })

            } else {
                res.status(200).json({
                    message: 'Product fetched',
                    product: requestedProduct,
                    relatedProducts: relatedProducts,
                })
            }

           

                  

        })           
        .catch(err => {
            console.log(err)
        })
}



const addingViewsToUser = (userId, prodId, timeStamp) => {
    User.findById(userId)
        .then(user => {

            if(user.views.length > 0){ 
                // We already have views data

                //Find if the current product is already in the data set
                let currentViewedProduct = user.views.find(view => view.productId.toString() === prodId.toString())

                if(!currentViewedProduct){
                    //The current product is not in the data set
                    user.views = [
                        ...user.views,
                        {
                            productId: prodId,
                            times: [timeStamp],
                            counter: 1
                        }
                    ]
                } else {
                    //the current product is in the data set
                    user.views.forEach(view => {
                        if(view.productId.toString() === prodId.toString()){
                            view.times.push(timeStamp)
                            view.counter = view.counter + 1
                        }
                    })
                }
            } else {
                //No views data yet
                user.views = [
                    {
                        productId: prodId,
                        times: [timeStamp],
                        counter: 1
                    }
                ]
            }

            return user.save()
        })
        .catch(err => {
            console.log(err)
        })
}


