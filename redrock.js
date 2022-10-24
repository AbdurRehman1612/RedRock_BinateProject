const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
const path = require('path');
const app = express();
var fs = require('fs');
const Chat = require('./models/Chat');
const {Patient} = require('./models/User');
const push_notification = require("./config/push_notification");

const {
  get_messages,
  send_message
} = require('./utils/messages');
// const server = require('https').createServer(options, app);
 
const connect = require('./db/db');
require('dotenv').config();



const userRouters = require('./routes/userRoutes');
const patientRouters = require('./routes/patientRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const PORT = process.env.PORT || 3009;
connect();

app.use(express.json());

app.use(cors())

app.use('/', userRouters);
app.use('/', patientRouters);
app.use('/', productRoutes);
app.use('/', orderRoutes);
app.use('/', conversationRoutes);
app.use('/', messageRoutes);

app.use('/uploads', express.static('uploads'));

app.use(express.static(path.resolve('../Red_Rock/build/')));


app.get('*', function (req, res) {    
    res.sendFile(path.resolve('../Red_Rock/build/index.html'));
    //res.sendFile(path.resolve(__dirname, 'admin', 'build', 'index.html')); 
  });

// sockit
const options = {
    key: fs.readFileSync('/home/serverappsstagin/ssl/keys/c2a88_d6811_bbf1ed8bd69b57e3fcff0d319a045afc.key'),
    cert: fs.readFileSync('/home/serverappsstagin/ssl/certs/server_appsstaging_com_c2a88_d6811_1665532799_3003642ca1474f02c7d597d2e7a0cf9b.crt'),
};
const server =  require('https').createServer(options,app);
// const io = require('socket.io')(server);
var io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST","PATCH","DELETE"],
        credentials: true,
        transports: ['websocket', 'polling'],
        allowEIO3: false
    },
});
io.on('connection', socket => {
  console.log("socket connection " + socket.id);
  socket.on('get_messages', function(object) {
      var user_room = "user_" + object.sender_id;
        socket.join(user_room);
        get_messages(object, function (response) { 
            if (response.length > 0) {
                console.log("get_messages has been successfully executed...");
                io.to(user_room).emit('response', { object_type: "get_messages", data: response });
            } else {
                console.log("get_messages has been failed...");
                io.to(user_room).emit('error', { object_type: "get_messages", message: "There is some problem in get_messages..." });
            }
        });
  });
  // SEND MESSAGE EMIT
  
  socket.on('send_message', function(object) {
      var sender_room = "user_" + object.sender_id;
        var receiver_room = "user_" + object.receiver_id;
        send_message(object, async (response_obj)=> {
            if (response_obj) {
                console.log("send_message has been successfully executed...");
                 io.to(sender_room).to(receiver_room).emit('response', { object_type: "get_message", data: response_obj }); 
                 const nurse=await Patient.findOne({_id:object?.sender_id}).populate("user_id", "user_fname user_lname user_device_token") 
                 if(nurse){    
                const notification_obj = {
              user_device_token: nurse?.user_id?.user_device_token,
              sender_text: object?.message,
              heading: `new message from ${nurse?.user_id?.user_fname} ${nurse?.user_id?.user_lname}`  
            }; 
           await push_notification(notification_obj);
                 }
            } else {
                console.log("send_message has been failed...");
                io.to(sender_room).to(receiver_room).emit('error', { object_type: "get_message", message: "There is some problem in get_message..." });
            }
        });
  });
});
// server.listen(PORT);
  server.listen(PORT, () => {
    console.log('Server up on Port ', PORT);
})