const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')


const { validationResult } = require('express-validator');
const User = require('../models/user');

const io = require('../socket');


exports.signup = (req, res, next) => {

    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error
    }

    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName
    const password = req.body.password;


    bcrypt.hash(password, 12)
          .then( encryptedPassword => {

            const user = new User({
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: encryptedPassword,
                active: false
                
            })

            return user.save()
          })
          .then( result => {

            

              res.status(201)
                .json({ message: 'User created',
                      userId: result._id})
          })
          .catch( err => {
              if(!err.statusCode){
                  err.statusCode = 500
              }

              console.log(err)
          })
}


exports.login = (req, res, next ) => {
    const email = req.body.email;
    const password = req.body.password;
    const timeStamp = req.body.timeStamp;
    let userAskingLogin;
    User.findOne({ email: email})
        .then( user => {
            if(!user){
                const error = new Error('A user with this email could not be found');
                error.statusCode = 401;
                throw error
            }

            userAskingLogin = user;

            return bcrypt.compare(password, user.password); // return true or false
        })
        .then(isEqual => {
            if(!isEqual){
                const error = new Error('Wrong password')
                error.statusCode = 401;
                throw error
            }

            userAskingLogin.active = true;

            newConnectionData = [...userAskingLogin.connection, {
                start: timeStamp,
                end: 'none'
            }];

            userAskingLogin.connection = newConnectionData;

            return userAskingLogin.save()
        })
        .then( result => {

            const token = jwt.sign({
                email: userAskingLogin.email,
                userId: userAskingLogin._id.toString()
                },
                'PkItj7221YGJbcsaYIL90!lmfds?mPdlf21l32nfe9',
                { expiresIn: '24h'}
                );

                io.getIO().emit('userLoggedIn', result);

                let lastPostion = result.connection.length - 1

                res.status(200).json({
                    token: token,
                    userId: userAskingLogin._id,
                    connectionId: result.connection[lastPostion]._id

                })
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500
            }

            console.log(err)
        })



            
}


exports.startConnection = (req, res, next ) => {

    const userId= mongoose.Types.ObjectId(req.body.userId);
    const timeStamp = req.body.timeStamp;
   


    User.findById(userId)
        .then( user => {
            if(!user){
                const error = new Error('No user found');
                error.statusCode = 401;
                throw error
            }

            user.active = true;

            user.connection = [...user.connection, {
                start: timeStamp,
                end: 'none'
            }]
            return user.save()
        })
        .then( result => {
            
            io.getIO().emit('userLoggedIn', result);

            let lastPosition = result.connection.length - 1;

            res.status(200).json({
                message: 'last connection updated',
                connectionId: result.connection[lastPosition]._id
            })
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500
            }
            console.log(err)
        })            
}


exports.endConnection = (req, res, next ) => {

    const userId= mongoose.Types.ObjectId(req.body.userId);
    const timeStamp = req.body.timeStamp;
    const connectionId =  mongoose.Types.ObjectId(req.body.connectionId);


    
   

    let userEndingConnection;

    User.findById(userId)
        .then( user => {
            if(!user){
                const error = new Error('No user found');
                error.statusCode = 401;
                throw error
            }

            userEndingConnection = user;

            userEndingConnection.active = false
            
        return  userEndingConnection.connection.forEach( i => {
                if(i._id.toString() === connectionId.toString()){
                    i.end = timeStamp;

                    console.log('found one to end')
                   
                }
            })

          
        })
        .then( () => {
          
            return userEndingConnection.save()
        })
        .then( result => {

            console.log(result)

            io.getIO().emit('userLoggedOut', result);


            res.status(200).json({
                message: 'last connection updated',
                user: result
            })
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500
            }
            console.log(err)
        })            
}