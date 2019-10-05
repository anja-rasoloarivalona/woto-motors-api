const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();


/*---------ROUTES-------*/
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

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
app.use('/messages', messageRoutes)



/*
app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=> {
      res.send(messages);
    })
})
*/
/*

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
*/





mongoose
//    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wijrw.mongodb.net/shop`)
    .connect(`mongodb+srv://anja:anjanirina@cluster0-wijrw.mongodb.net/africauto`, { useNewUrlParser: true, useUnifiedTopology: true } )

    .then(result =>{ 

        const server = app.listen(process.env.PORT || 8000);
        const io = require('./socket').init(server);

        io.on('connection', socket => {
          console.log('client connected')
        })



    })
    .catch(err => 
        console.log(err)
   );