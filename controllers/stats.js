const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product');



exports.getNotifications = (req, res, next) => {
    User.find()
        .select('_id notification')
        .then( user => {

            let notifData = [];

            user.forEach( i => {
                if(i.notification === true){
                    notifData.push(i._id)
                }
            })
            
            res.status(200)
                .json({
                    info: 'Notifications state fetched',
                    notifData: notifData
                })
        })
        .catch(err => {
            console.log(err)
        })

}

exports.addANotification = (req, res, next) => {

    const userId = mongoose.Types.ObjectId(req.params.userId);

    User.findById(userId)
        .select('notification')
        .then( user => {

            if(!user){
                const error = new Error('No user found')
                error.statusCode = 404
                throw error
            }

            if(!user.notification){
                user.notification = true
            }
            
            return user.save()

        })
        .then(result => {
            console.log(result);

            res.status(200)
            .json({
                info: 'Notification added',
                notification: {
                    userId: result._id,
                    notifState: result.notification
                } 
            })
        })
        .catch(err => {
            console.log(err)
        })

}

exports.getProductsStats = (req, res, next) => {

    let statsData = {};

    Product
        .find()
        .select('general.viewCounter general.brand general.model')
        .sort({ 'general.viewCounter': -1})
        .then(products => {
            if(!products){
                const error = new Error('Products not found');
                error.statusCode = 404
                throw error
            }
            products.forEach( product => {
                if(!Object.keys(statsData).includes(product.general.brand)){
                    //The current brand is not part of the data set yet
                    statsData[product.general.brand] = {
                        views : product.general.viewCounter,
                        models : 
                            { [product.general.model] : product.general.viewCounter}
                        
                    }
                } else {
                    //The current brand is already include in the data set
                   
                    if(!Object.keys(statsData[product.general.brand].models).includes(product.general.model)){
                            //The model of the current brand is not in the data set
                            statsData[product.general.brand] = {
                                views: statsData[product.general.brand].views + product.general.viewCounter,
                                models: {
                                    ...statsData[product.general.brand].models,
                                    [product.general.model] : product.general.viewCounter}
                            }
                        } else {
                            //The model of the current brand is already in the data set  
                            statsData[product.general.brand] = {
                                views: statsData[product.general.brand].views + product.general.viewCounter,
                                models: {
                                    ...statsData[product.generl.brand].models,
                                    [product.general.model] : statsData[product.general.brand].models[product.general.model] + product.general.viewCounter
                                }
                            }
                        }
                    } 
            })


            res
            .status(200)
            .json({ message: 'Fetched products stats', stats: statsData})
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getUserConnectionStats = (req, res, next) => {


    User
        .find()
        .select('connection')
        .then(stats => {
            if(!stats){
                const error = new Error('Not able to get user connection stats');
                error.statusCode = 404
                throw error
            }

            res
            .status(200)
            .json({ message: 'Fetched user connection stats', stats: stats})
        })
        .catch(err => {
            console.log(err)
        })
}