const mongoose = require('mongoose');
const Product = require('../models/product');
const Supplier = require('../models/supplier');


exports.addSupplier = (req, res, next) => {
    
    console.log(req.body.responsibles);


    let name = req.body.name,
        email = req.body.email,
        phoneNumber = req.body.phoneNumber,
        address = req.body.address,
        responsibles = req.body.responsibles


    let responsiblesArray = [];

    Object.keys(responsibles).forEach(responsible => {
        responsiblesArray.push({
            name: responsibles[responsible].name.value,
            email: responsibles[responsible].email.value,
            number: responsibles[responsible].phoneNumber.value,
            title: responsibles[responsible].title.value,
        })
    })

    const supplier = new Supplier({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
        responsibles: responsiblesArray
    })

    supplier
        .save()
        .then(result => {
            res.status(201)
                .json({
                    message: 'Supplier created successfully',
                    supplier: supplier
                })
        })
        .catch(err => {
            console.log(err)
        })

}