require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var app = express();
var server = require("http").Server(app);
var io = require('socket.io')(server);


var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');

var indexRouter = require('./routes/index');
var socialRouter = require('./routes/social');



const port = process.env.PORT || 3000;

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src')));

// Routes
app.use(indexRouter);
app.use(socialRouter);

let users = [];
io.on('connection', function(socket){
  // console.log('a user connected ' + socket.id);
  
  
  socket.emit('greet', users, socket.id)
  console.log(users)


  socket.on('adduser' , (data) => {
    socket.broadcast.emit('adduser', data, socket.id)
    let userData = {
      id: socket.id,
      data: data
    }
    users.push(userData)
  })

    socket.on('disconnect', function(){
      console.log(socket.id)
      users = users.filter( user => user.id != socket.id)
      console.log('usersdfasdf')
      console.log(users)
      socket.broadcast.emit('removeuser', users)
    });

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
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

