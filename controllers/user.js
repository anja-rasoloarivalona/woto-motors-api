const User = require('../models/user');
const mongoose = require('mongoose');
const Product = require('../models/product')

exports.addFavorite = async (req, res, next) => {

    console.log('aaaaading');

    let userId =  mongoose.Types.ObjectId(req.params.userId) 
    let prodId =  mongoose.Types.ObjectId(req.query.prodId) 
    let action = 'add';

    try {
        await toggleFollowerToProduct(prodId, userId, action);
        await toggleFavoriteToUser(prodId, userId, action);
    }       
    catch (err) {
        console.log(err)
    }

    res.status(200).json({
        message: 'product added to favorite'
    })
   
    
}

exports.removeFavorite = async (req, res, next) => {

    console.log('removininging');


    let userId =  mongoose.Types.ObjectId(req.params.userId) 
    let prodId =  mongoose.Types.ObjectId(req.query.prodId) 
    let action = 'remove';

    try {
        await toggleFollowerToProduct(prodId, userId, action);
        await toggleFavoriteToUser(prodId, userId, action);
    }       
    catch (err) {
        console.log(err)
    }

    res.status(200).json({
        message: 'product remove to favorite'
    })
}

const toggleFollowerToProduct = (productId, userId, action) => {
    Product
    .findById(productId)
    .then( product => {
        if(!product){
            const error = new Error('No product found')
            error.statusCode = 404
            throw error
        }

        if(action === 'add'){
            product.followers = [...product.followers, userId]
        }
        if(action === 'remove'){
            product.followers = product.followers.filter(follower => follower.toString() !== userId.toString())
        }
        
        return product.save()
    })
    .catch(err => {
        console.log(err)
    })
}

const toggleFavoriteToUser = ( productId, userId , action) => {
    User
    .findById(userId)
    .then( user => {

        if(!user){
            const error = new Error('No user found')
            error.statusCode = 404
            throw error
        }

        if(action === 'add'){
            user.favorites = [...user.favorites, productId]
        }

        if(action === 'remove'){
            user.favorites = user.favorites.filter(product => product.toString() !== productId.toString())
        }
        
        return user.save()
    })
    .catch(err => {
        console.log(err)
    })
}