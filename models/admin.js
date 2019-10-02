const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const adminSchema = new Schema({
    email: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true,
    },

    firstName: {
        type: String,
        require: true
    },

    lastName: {
        type: String,
        require: true
    },


    superAdmin: {
        type: Boolean,
        require: true
    }
})


module.exports = mongoose.model('Admin', adminSchema)