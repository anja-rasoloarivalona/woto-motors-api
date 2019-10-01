const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const http = require('http').Server(app);
const mongoose = require('mongoose');
const helmet = require('helmet');


const io = require('socket.io')
const socket = io(http)

/*---------ROUTES-------*/
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use(helmet());

app.use('*', cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
  

 

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);


let Message = mongoose.model('Message', { name: String, message: String});


app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=> {
      res.send(messages);
    })
})

app.post('/messages', (req, res) => {

    console.log(req.body);


    var message = new Message(req.body);
    message.save((err) =>{
      if(err)
        sendStatus(500);
      socket.emit('message', req.body);
      res.sendStatus(200)
    })
})

socket.on('connection', () => {
    console.log('a user is connected')
})



mongoose
//    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wijrw.mongodb.net/shop`)
    .connect(`mongodb+srv://anja:anjanirina@cluster0-wijrw.mongodb.net/africauto`, { useNewUrlParser: true, useUnifiedTopology: true } )

    .then(result =>{ 
        console.log('still working')
        http.listen(process.env.PORT || 8000)

    })
    .catch(err => 
        console.log(err)
   );