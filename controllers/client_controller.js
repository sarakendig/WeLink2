var app = require('express')(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    session = require("express-session")({
        secret: "my-secret",
        resave: true,
        saveUninitialized: true
    }),
    sharedsession = require("express-socket.io-session");




    /// CLIENT


const messageInput = document.getElementById('message-input');
const sendMessage = document.getElementById('send-box');
const messagebox = document.getElementById('message-box');

socket.on('message', data => {
    appendMsg(data)
})

sendBox.addEventListener('submit', event => {
    event.preventDefault()
    const msg = messageInput.value
    socket.emit('send-message', msg)
    messageInput.value = ''
})


function appendMsg(msg) {
    const msgText = document.createElement('div')
    msgText.innerText = msg
    messagebox.append(msgText)
}

// SERVER

// Attach session
app.use(session);

// Share session with io sockets
io.use(sharedsession(session));



// app.get('/', function(req, res) {
//     res.sendfile('/chat/index.ejs');
//  });




io.on("connection", function (socket) {
    // Accept a login event with user's data
    socket.on("login", function (userdata) {
        socket.handshake.session.userdata = userdata;
        socket.handshake.session.save();
        io.socket.emit(''
        console.log('a user is connected'))
    },

    socket.emit('message', 'Welcome to the Chat!')
    socket.on('send-message', msg => {
        socket.broadcast.emit('msg')
    }),

    socket.on("logout", function (userdata) {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    })
    
});



module.exports = chats


