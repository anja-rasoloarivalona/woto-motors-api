const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');



const app = express();

/*---------ROUTES-------*/
const adminRoutes = require('./routes/admin');

app.use(helmet());

app.use('*', cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
  

 

app.use('/admin', adminRoutes);




mongoose
//    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wijrw.mongodb.net/shop`)
    .connect(`mongodb+srv://anja:anjanirina@cluster0-wijrw.mongodb.net/africauto`, { useNewUrlParser: true, useUnifiedTopology: true } )
    .then(result =>{
        console.log('connected')
        app.listen(process.env.PORT || 8000)
    })
    .catch(err => 
        console.log(err)
   );