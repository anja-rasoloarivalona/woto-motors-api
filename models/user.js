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
    }
})


module.exports = mongoose.model('User', userSchema)