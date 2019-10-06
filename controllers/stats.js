
const mongoose = require('mongoose');

const User = require('../models/user');



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