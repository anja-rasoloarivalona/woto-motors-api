const mongoose = require('mongoose');
const Product = require('../models/product');
const Supplier = require('../models/supplier');


exports.addSupplier = (req, res, next) => {

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
            phoneNumber: responsibles[responsible].phoneNumber.value,
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

exports.getSuppliers = (req, res, next) => {
    Supplier
        .find()
        .populate('products')
        .exec()
        .then(suppliers => {
    
                if(!suppliers){
                    const error = new Error('Could not fetch suppliers');
                    error.statusCode = 401;
                    throw error
                }
    
                 res
                  .status(200)
                  .json({ message: 'Fetched suppliers', suppliers: suppliers})
        })
        .catch(err => {
            console.log(err)
        })
}

exports.editSupplier = (req, res, next) => {

    console.log('editing....');

    let name = req.body.name,
        email = req.body.email,
        phoneNumber = req.body.phoneNumber,
        address = req.body.address,
        responsibles = req.body.responsibles,
        supplierId = mongoose.Types.ObjectId(req.body._id);


    let responsiblesArray = [];

    Object.keys(responsibles).forEach(responsible => {
    responsiblesArray.push({
        name: responsibles[responsible].name.value,
        email: responsibles[responsible].email.value,
        phoneNumber: responsibles[responsible].phoneNumber.value,
        title: responsibles[responsible].title.value,
        })
    })

    Supplier.findById(supplierId)
            .then(supplier => {
                if(!supplier){
                    const error = new Error('Could not find supplier')
                    error.statusCode = 404;
                    throw error
                }

                supplier.name = name;
                supplier.email = email;
                supplier.phoneNumber = phoneNumber;
                supplier.address = address;
                supplier.responsibles = responsiblesArray;

                return supplier.save()
            })
            .then(result => {
                res.status(200)
                   .json({
                       message: 'Supplier edited',
                       supplier: result
                   })
            })
            .catch(err => {
                console.log(err)
            })


}

exports.deleteSUpplier = (req, res, next) => {
    const supplierId = req.params.supplierId;

    Supplier
        .findById(supplierId)
        .then( supplier => {
            if(!supplier){
                const error = new Error('Could not find supplier.');
                error.statusCode = 404;
                throw error;
            }
            return Product.deleteMany({ _id: { $in: supplier.products}});
        })
        .then( result => {
            return Supplier.findByIdAndRemove(supplierId)
        })
        .then( result => {
            res.status(200).json({ message: 'Supplier deleted'})
        })
        .catch(err => {
                console.log(err)
        })
}