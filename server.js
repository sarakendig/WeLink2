//___________________
//Dependencies
//___________________


var app = require('express')(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    session = require("express-session")({
        secret: "my-secret",
        resave: true,
        saveUninitialized: true
    }),
    sharedsession = require("express-socket.io-session");


const methodOverride = require('method-override');
const mongoose = require('mongoose');
const db = mongoose.connection;


require('dotenv').config()




//___________________
//Port
//___________________
// Allow use of Heroku's port or your own local port, depending on the environment
const PORT = process.env.PORT || 3004;

//___________________
//Database
//___________________

// How to connect to the database either via heroku or locally
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/WeLink';

// Connect to Mongo
mongoose.connect(
    MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    () => {
        console.log('the connection with mongod is established at', MONGODB_URI)
    })

// Error / success
db.on('error', (err) => console.log(err.message + ' is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));

// open the connection to mongo
db.on('open', () => {});


//___________________
//Middleware
//___________________

// Attach session
app.use(session);

//use public folder for static assets
// app.use(express.static('public'));

// populates req.body with parsed info from forms - if no data from forms will return an empty object {}
app.use(express.urlencoded({
    extended: false
})); // extended: false - does not allow nested objects in query strings
app.use(express.json()); // returns middleware that only parses JSON - may or may not need it depending on your project

//use method override
app.use(methodOverride('_method')); // allow POST, PUT and DELETE from a form


// app.use(
//     session({
//         secret: 'scretIdHere', //a random string do not copy this value or your stuff will get hacked
//         resave: false, // default more info: https://www.npmjs.com/package/express-session#resave
//         saveUninitialized: false // default  more info: https://www.npmjs.com/package/express-session#resave
//     })
// )

//___________________
// Controllers
//___________________

const messagesController = require('./controllers/messages_controller.js')
app.use('/messages', messagesController)


const usersController = require('./controllers/users_controller.js')
app.use('/users', usersController)

const sessionsController = require('./controllers/sessions_controller.js')
app.use('/sessions', sessionsController)





//___________________
// Routes
//___________________
//localhost:3004
app.get('/', (req, res) => {
    res.redirect('/messages')
});
app.get('/chat', (req, res) => res.sendFile(__dirname + '/index.ejs'))


//___________________
//SOCKETS
//___________________

// Share session with io sockets
 
io.use(sharedsession(session));
 

io.on("connection", socket => {

    console.log('new user connected ', socket.id)

    socket.on('login', function(userdata) {
        socket.handshake.session.userdata = userdata;
        socket.handshake.session.save();
        io.emit('login', socket.id + 'Welcome to the Chat!');
    });

    socket.on('chat', msg => {
        console.log(msg)
        io.emit('chat', socket.id +':' + msg)
    });

    socket.on('logout',function(userdata) {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
        io.emit('logout', socket.id + ' has disconnected')
    });        


})



//___________________
//Listener
//___________________


server.listen(PORT, () => {
    console.log("server is listening on localhost:" + PORT);
});