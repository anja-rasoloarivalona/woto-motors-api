const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    name: String,
    email: String,
    phoneNumber: String,
    address: String,
    
    responsibles: [{
        name: String,
        email: String,
        number: String,
        title: String
    }]
})

module.exports = mongoose.model('Supplier', supplierSchema)