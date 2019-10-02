const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')


const { validationResult } = require('express-validator');
const User = require('../models/user');


exports.signup = (req, res, next) => {

    const errors = validationResult(req);

    console.log(req.body)


    if(!errors.isEmpty()){

        console.log('error', errors)



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
                password: encryptedPassword
                
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

    console.log('body', req.body);


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

            userAskingLogin.lastConnection = timeStamp

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

                res.status(200).json({
                    token: token,
                    userId: userAskingLogin._id.toString()
                })
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500
            }

            console.log(err)
        })



            
}


exports.updateLastConnection = (req, res, next ) => {

    console.log('body', req.body);

    const userId= mongoose.Types.ObjectId(req.body.userId);
    const timeStamp = req.body.timeStamp;

    User.findById(userId)
        .then( user => {
            if(!user){
                const error = new Error('No user found');
                error.statusCode = 401;
                throw error
            }

            user.lastConnection = timeStamp
            return user.save()
        })
        .then( result => {
            res.status(200).json({
                message: 'last connection updated'
            })
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500
            }
            console.log(err)
        })            
}