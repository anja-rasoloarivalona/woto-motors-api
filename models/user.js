const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    firstName : {
        type: String,
        require: true
    },

    lastName: {
        type: String,
        require: true
    },

    connection: [{
        start: String,
        end: String
    }],

    phoneNumber: {
        type: String
    },

    messages: [
        {
          from: String,
          message: String,
          timeStamp: String,
          senderType: String,
          read: Boolean,
          readBy: String,
          readByTimeStamp: String
        }
    ],

    notification: Boolean,
    active: Boolean,

    views: [
        {
        productId: String,
        times: [{
            type: String
            }],
        counter: Number
        }
    ],

    notes: [
        {
            timeStamp: String,
            text: String,
            creator: String,
            title: String
        }
    ],
    favorites: [{
        type: String
    }]


}, {timestamps: true})


module.exports = mongoose.model('User', userSchema)