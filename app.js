require('dotenv').config();
let createError = require('http-errors');
let express = require('express');
let app = express();
let server = require("http").Server(app);
let io = require('socket.io')(server);


let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let logger = require('morgan');
let hbs = require('express-handlebars');

let indexRouter = require('./routes/index');
let socialRouter = require('./routes/social');

const port = process.env.PORT || 3000;

// view engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src')));

// Routes
app.use(indexRouter);
app.use(socialRouter);

// Moet dit op de route waar verbinding pas nodig is?
let users = [];
io.on('connection', function (socket) {
  socket.emit('greet', users, socket.id)
  socket.on('adduser', (data) => {
    socket.broadcast.emit('adduser', data, socket.id)
    let userData = {
      data: data
    }
    users.push(userData)
    console.log(users)
    
  })

  socket.on('updateuser', function(user){
    let target = users.find(userList => {
      return userList.data.id == user.id
    })
    target.data.x = user.x;
    target.data.y = user.y;
    
    io.emit('updatelocations', users)
  })

  socket.on('disconnect', function () {
    socket.id;
    users = users.filter(user => user.data.id != socket.id)
    socket.broadcast.emit('removeuser', users)
  });

});




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


server.listen(port, function () {
  console.log("listening on: 3000");
});

module.exports = app;