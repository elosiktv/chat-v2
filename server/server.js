const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './avatars')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '.jpg')
    }
})

const upload = multer({ storage: storage });

const app = express();

app.use('/avatars', express.static(path.join(__dirname, 'avatars')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

require('./routes/profiles')(app, upload);
require('./routes/auth')(app);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/chat-v2', {useNewUrlParser: true});
mongoose.connection.on('error', (err) => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

const server = app.listen(process.env.PORT || 8080, () => console.log('Server running'));
const io = socket(server);
const socketRoute = require('./routes/socket');

const jwt = require('jsonwebtoken');
const secret = require('./config/secret');

let activeUsers = [];

io.use(function(socket, next) {
    if (socket.handshake.headers.cookie) {
        let cookies = socket.handshake.headers.cookie;
        let tokenFromCookies = cookies.substring(cookies.indexOf('token'));
        let token = tokenFromCookies.split('=')[1].split(';')[0];
        if (token) {
            jwt.verify(token, secret, function(err, decoded) {
                if (!err) {
                    socket.username = decoded.username;
                    next();
                }
            });
        }
    }
})
.on('connection', (socket) => {

    activeUsers.push({
        [socket.username]: socket.id
    });

    socket.on('disconnect', () => {
        delete activeUsers[socket.username];
    });

    socket.on('createNewChat', socketRoute.createNewChat(socket, io, activeUsers));

    socket.on('getUserChats', socketRoute.getUserChats(socket));

    socket.on('sendChatMessage', socketRoute.sendChatMessage(socket, io, activeUsers));

    socket.on('removeChat', socketRoute.removeChat(socket, io, activeUsers));

});