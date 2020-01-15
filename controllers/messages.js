const User = require('../models/user');
const Admin = require('../models/admin');

const mongoose = require('mongoose');

const io = require('../socket');






//FIND ALL MESSAGES FOR ADMIN AND RETRIEVE THE LAST USER MESSAGE ONLY
'firstName lastName messages _id'
exports.getMessages = (req, res, next) => {
    User.find()
        .select('firstName lastName _id')
        .slice('messages', -1)
        .then( messages=> {
       
        if(!messages){
            const error = new Error('No Messages found')
            error.statusCode = 404
            throw error 
        }

        res.status(200)
            .json({
                info: 'Messages fetched',
                messages: messages
            })
    })
  


}

//Find ALL MESSAGES FOR THE USER

exports.getMessagesUserAsAdmin = (req, res, next) => {

    const userId = mongoose.Types.ObjectId(req.params.userId);

    let adminName = req.body.adminName;
    let timeStamp = req.body.timeStamp;

  

    User.findById(userId)
        .select('firstName lastName messages notification active email phoneNumber notes')
       .then( user => {
            if(!user){
                const error = new Error('No user found')
                error.statusCode = 404
                throw error
            }

            user.messages.forEach( i => {
                if(i.senderType === 'user'){
                    return i.read = true;
                }          
            })

            user.messages.forEach(i => {
                if(i.readBy === 'none'){      
                    i.readBy = adminName;
                    i.readByTimeStamp = timeStamp;      
                }
            })

            if(user.notification === true){
                user.notification = false
            }

            return user.save()
       })
       .then( userInfo => {
            res.status(200)
            .json({
                info: 'Messages fetched',
                user: userInfo
            })
       })
}

exports.getMessagesUserAsUser = (req, res, next) => {

    const userId = mongoose.Types.ObjectId(req.params.userId);

    User.findById(userId)
        .select('firstName lastName messages')
       .then( user => {
            if(!user){
                const error = new Error('No user found')
                error.statusCode = 404
                throw error
            }

            res.status(200)
                .json({
                    info: 'Messages fetched',
                    messages: user
                })
       })
}

exports.getMessagesUserAsUserAndUpdate = (req, res, next) => {

    const userId = mongoose.Types.ObjectId(req.params.userId);

    let timeStamp = req.body.timeStamp;
    let userName = req.body.userName;

    User.findById(userId)
        .select('firstName lastName messages')
       .then( user => {
            if(!user){
                const error = new Error('No user found')
                error.statusCode = 404
                throw error
            }

            user.messages.forEach(i => {
                if(i.read === false){
                    i.read = true;
                    i.readByTimeStamp = timeStamp;
                    i.readBy = userName
                }
            })
            return user.save();

       })
       .then(result => {

        io.getIO().emit('userReadNewMessages', result)


            res.status(200)
            .json({
                info: 'Messages fetched',
                messages: result
            })
       })
}


// USER SEND MESSAGES

exports.postMessagesUser = (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.params.userId);

    const from = req.body.from;
    const message = req.body.message;
    const timeStamp = req.body.timeStamp;

    const type = 'user';

    let messagesData =
        {
            from: from, 
            message: message,
            timeStamp: timeStamp,
            senderType: type,
            read: false,
            readBy: 'none',
            readByTimeStamp: 'none'
        }
    
    User.findById(userId)
        .then( user => {
            if(!user){
                const error = new Error('No user found')
                error.statusCode = 404
                throw error
            }

            if(!user.messages){
                user.messages = [messagesData]
            } else {
                user.messages.push(messagesData)
            }

            return user.save()
        })
        .then( result => {
     
            let lastPosition = result.messages.length - 1;
           

            io.getIO().emit('userSentMessage', {
                messageData: {
                    _id: result.messages[lastPosition]._id,
                    message: message,
                    from: from,
                    timeStamp: timeStamp,
                    senderType: type,
                    userId: userId,
                    read: false,
                    readBy: 'none',
                    readByTimeStamp: 'none'
                }
            })

            let messageResponse = {
                ...messagesData,
                _id: result.messages[lastPosition]._id
            }

            res.status(201).json({
                info: 'Message Sent successfully',
                data: messageResponse
            })
        })
        .catch( err => {
            if (!err.statusCode) {
                err.statusCode = 500;
              }  

              console.log(err)
        })

}


// ADMIN SEND MESSAGES

exports.postMessagesAdmin = (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.params.userId);

    const from = req.body.from;
    const message = req.body.message;
    const timeStamp = req.body.timeStamp;
    const type = 'admin';

    const messagesData = 
        {
            from: from, 
            message: message,
            timeStamp: timeStamp,
            senderType: type,
            read: false,
            readBy: 'none',
            readByTimeStamp: 'none',
            userId: userId
        }
    

    User.findById(userId)
        .then( user => {
            if(!user){
                const error = new Error('No user found')
                error.statusCode = 404
                throw error
            }

            if(!user.messages){
                user.messages = [messagesData]
            } else {
                user.messages.push(messagesData)
            }

            return user.save()
        })
        .then( result => {

            let lastPosition = result.messages.length - 1;

            let resultMessageData = {
                _id: result.messages[lastPosition]._id,
                from: from,
                timeStamp: timeStamp,
                senderType: type,
                message: message,
                userId: userId,
                read: false,
                readBy: 'none',
                readByTimeStamp: 'none'
            }

            io.getIO().emit('adminSentMessage', {
                messageData: resultMessageData
            })

            res.status(201).json({
                info: 'Message Sent successfully',
                data: resultMessageData
            })
        })
        .catch( err => {
            if (!err.statusCode) {
                err.statusCode = 500;
              }  

              console.log(err)
        })

}