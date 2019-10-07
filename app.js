const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();

const User = require('./models/user');

const timeStampGenerator = require('./utilities/timeStampGenerator');


/*---------ROUTES-------*/
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const statsRoutes = require('./routes/stat');

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
app.use('/messages', messageRoutes);
app.use('/stats', statsRoutes)




mongoose
//    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wijrw.mongodb.net/shop`)
    .connect(`mongodb+srv://anja:anjanirina@cluster0-wijrw.mongodb.net/africauto`, { useNewUrlParser: true, useUnifiedTopology: true } )

    .then(result =>{ 

        const server = app.listen(process.env.PORT || 8000);
        const io = require('./socket').init(server);

      /*  io.on('connection', socket => {
          console.log('client connected')

          console.log(socket);


          socket.on('disconnect', () => {

              io.emit('disconnected')
              console.log('client disconnection happengin')
          })

          socket.on('userGone', data => {
              console.log('userId', data)
          })


        })*/


    

        io.use(function(socket, next){

            var data = socket.request._query.data;

            if(data){
                console.log('data', data);

                let userId = mongoose.Types.ObjectId(data.split(' ')[0]);
                let connectionId = mongoose.Types.ObjectId(data.split(' ')[1]);
                
     
                console.log('connected', connectionId)
     
                 socket.on('disconnect', () => {
                    
                     let userEndingConnection

                     
     
                    User.findById(userId)
                         .then( user => {
     
                             if(!user){
                                 const error = new Error('No user found');
                                 error.statusCode = 401;
                                 throw error
                             }

                             let timeStamp = timeStampGenerator()
     
                             userEndingConnection = user;
                             userEndingConnection.active = false;
     
                             return  userEndingConnection.connection.forEach( i => {
                                 if(i._id.toString() === connectionId.toString()){
                                     i.end = timeStamp
                                 }
                             })
                         })
                         .then( () => {
                             return userEndingConnection.save()
                         })
                         .then(result => {
                            io.emit('userLoggedOut', result);
                             console.log('disconnected')
                         })
                         .catch(err => {
                             console.log(err)
                         })
     
                 })
            }
            next()
        })

        



    })
    .catch(err => 
        console.log(err)
   );