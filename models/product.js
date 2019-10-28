const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({

    general: [{
        title: {
            type: String,
            required: true
        },
        
        made: {
            type: String,
            required: true
        },

        model: {
            type: String,
            required: true
        },

        year: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        nbKilometers: Number,
        gazol: String,
        yearOfRelease: String,
        transmissionType: String,
        nbOwners: Number,
        serialNumber: String,
        generalState: String,
        mainImgUrl: String,
        publicity: String,
        homePage: String
    
    }],


    tech: [{
        nbGearRatios: Number,
        nbCylinders: Number,
        motorSize: String,
        maxSpeed: String
    }],

    design: [{
        intColor: String,
        extColor: String
    }],

    features: [{
        type: String
    }],

    albumId: String,
    imageUrls: [{
        type: String
    }],

    views: [{
        userId: String,
        timeStamp: String
    }]

   
}, {timestamps: true})


/*productSchema.methods.getName = () => {

}*/



module.exports = mongoose.model('Product', productSchema)