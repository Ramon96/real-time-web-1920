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
let botActive = false;
let host = undefined;

io.on('connection', function (socket) {
  socket.emit('greet', users, socket.id)

  socket.on('adduser', (data) => {
    socket.broadcast.emit('adduser', data, socket.id)
    let userData = {
      data: data
    }
    users.push(userData)
    checkHost();

    if (users.length <= 10 && users.length > 0 && botActive == false) {
      // the host has joined
      addbots();
      botActive = true;
    }
    if (!data.id.startsWith('bot') && botActive == true && users.length >= 2) {
      console.log('new additional user ' + data.id)
       removebot(); // hier gaat hij op z'n bek
    }
  })


  function addbots() {
    io.to(host).emit('addbots', users);
    console.log('sending emit to ' + host)
  }

  function removebot() {
    // console.log('removing bot')
    let bot = users.find(userList => {
      return userList.data.id.startsWith('bot')
    })
    // maar wat als er geen bots meer zijn
    users = users.filter(target => target.data.id != bot.data.id)
    io.to(host).emit('removebot', users)
    io.emit('removeuser', users)
  }

  function checkHost() {
    // console.log('check host')
    if (host == undefined) {
      let user = users.filter(userList => {
        return !userList.data.id.startsWith('bot');
      })
      console.log(user)
      host = user[0].data.id;

    }
  }


  socket.on('updateuser', function (user) {
    let target = users.find(userList => {
      return userList.data.id == user.id
    })
    // single responsability pattern missing
    if(!target){
      // event emit om de host te laten weten dat de bot niet meer bestaat, hoeft niet want dat doe ik ergens anders al (brain food) 86
      return
    }
    // console.log(users)
    target.data.x = user.x;
    target.data.y = user.y;
    target.data.color = user.color;
    if (target.data.velocity) {
      // target.data.velocity  = user.velocity
      target.data.velocity  = user.velocity
    }
    // console.log('location emit')
    io.emit('updatelocations', users)
  })




  socket.on('disconnect', function () {
    socket.id;
    users = users.filter(user => user.data.id != socket.id)
    socket.broadcast.emit('removeuser', users)
    if (host == socket.id) {
      console.log('the host has left')
      host = undefined;
      // checkHost();
    }
    addbots();

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