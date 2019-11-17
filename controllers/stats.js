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
        .select('general.viewCounter general.made general.model')
        .sort({ 'general.viewCounter': -1})
        .then(products => {
            if(!products){
                const error = new Error('Products not found');
                error.statusCode = 404
                throw error
            }
            products.forEach( product => {
                if(!Object.keys(statsData).includes(product.general[0].made)){
                    //The current made is not part of the data set yet
                    statsData[product.general[0].made] = {
                        views : product.general[0].viewCounter,
                        models : 
                            { [product.general[0].model] : product.general[0].viewCounter}
                        
                    }
                } else {
                    //The current made is already include in the data set
                   
                    if(!Object.keys(statsData[product.general[0].made].models).includes(product.general[0].model)){
                            //The model of the current made is not in the data set
                            statsData[product.general[0].made] = {
                                views: statsData[product.general[0].made].views + product.general[0].viewCounter,
                                models: {
                                    ...statsData[product.general[0].made].models,
                                    [product.general[0].model] : product.general[0].viewCounter}
                            }
                        } else {
                            //The model of the current made is already in the data set  
                            statsData[product.general[0].made] = {
                                views: statsData[product.general[0].made].views + product.general[0].viewCounter,
                                models: {
                                    ...statsData[product.general[0].made].models,
                                    [product.general[0].model] : statsData[product.general[0].made].models[product.general[0].model] + product.general[0].viewCounter
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