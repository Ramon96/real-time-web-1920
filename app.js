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

// corona gamesettings
// Size of the circle
const playerRadius = 50;

// This changes the setInterval time speed of the bot movement, lower results in more lagg
const botInterval = 160000;

const gameMap = {
  width: 980,
  height: 750
};

// properties every player has
class defaultPlayerData {
  constructor(id) {
    this.id = id;
    this.position = {
        x: 0,
        y: 0
      },
      this.isSick = false;
      this.radius = playerRadius;
  }

  greet() {
    console.log("Hi im " + this.id)
  }
}

// Controllable player settings
class defaultUserData extends defaultPlayerData {
  constructor(id, position, isSick, radius, color) {
    super(id, position, isSick, radius);
    this.color = '#F03C69';
  }
}

// Bot settings
class defaultBotData extends defaultPlayerData {
  constructor(id, position, isSick, velocity, color, radius) {
    super(id, position, isSick, radius);
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.color = '#82A0C2';
  }

  move() {
    if(this.position.x - this.radius <= 0 || this.position.x + this.radius >= gameMap.width){
      this.velocity.x = -this.velocity.x
    }
    if(this.position.y - this.radius <= 0 || this.position.y + this.radius >= gameMap.height){
      this.velocity.y = -this.velocity.y
    }
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}


// List containing all the controllable players
let userList = [];
// List  containing all the bots
const botList = [];


// When an users connect to the server
io.on('connection', function (socket) {
  registerUser(socket.id)
  socket.emit('getId', socket.id);

  // give the client the dots to draw
  io.emit('drawPlayers', [...userList, ...botList])

  socket.on('disconnect', function () {
    // Remove disconnected player from the userlist
    userList = userList.filter(user => {
      return user.id != socket.id
    })
    addBots();
    io.emit('drawPlayers', [...userList, ...botList])

    console.log(socket.id + ' has disconnected');
  });


  socket.on('updateLocations', function (playerData) {
    let targetPlayer = userList.find(player => player.id == playerData.id)
    targetPlayer.position.x = playerData.position.x;
    targetPlayer.position.y = playerData.position.y;
    io.emit('drawPlayers', [...userList, ...botList])
  })

  removeBots();
  addBots();
  moveBots()

})

function registerUser(id) {
  let newUser = new defaultUserData(id);
  newUser.position = getAvailablePosition();
  userList.push(newUser)
}

function removeBots() {
  if (botList.length > 0) {
    botList.splice(1, 1);
    io.emit('drawPlayers', [...userList, ...botList])
  }
}

function addBots() {
  if ((userList.length + botList.length) < 10) {
    registerBot();
    // Recursion :)
    addBots()
  }

  io.emit('drawPlayers', [...userList, ...botList])
}

function registerBot() {
  let newBot = new defaultBotData(makeid(17));
  newBot.position = getAvailablePosition();
  newBot.velocity = {
    x: Math.random() - 0.5,
    y: Math.random() - 0.5
  }
  botList.push(newBot)
}

function moveBots() {
  setInterval(function () {
    botList.forEach(bot => {
      bot.move();
    });
    io.emit('drawPlayers', [...userList, ...botList])
  }, botInterval)
}

function getAvailablePosition() {
  let xPos = randomIntFromRange(playerRadius, gameMap.width - playerRadius);
  let yPos = randomIntFromRange(playerRadius, gameMap.height - playerRadius);

  // Checks if the given location is not already taken
  let combinedList = [...userList, ...botList];
  for (let i = 0; i < combinedList.length; i++) {
    if (distance(xPos, yPos, combinedList[i].position.x, combinedList[i].position.y) - playerRadius * 2 < 0) {
      xPos = randomIntFromRange(playerRadius, gameMap.width - playerRadius);
      yPos = randomIntFromRange(playerRadius, gameMap.height - playerRadius);

      i = -1;
    }
  }

  let position = {
    x: xPos,
    y: yPos
  }

  return position
}

// utility function from https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js
function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1
  const yDist = y2 - y1

  //https://nl.wikipedia.org/wiki/Stelling_van_Pythagoras
  // return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
  return Math.abs(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)))
}


function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return 'bot' + result;
}

// Moet dit op de route waar verbinding pas nodig is?
// let users = [];
// let botActive = false;
// let host = undefined;

// io.on('connection', function (socket) {
//   socket.emit('greet', users, socket.id)

//   socket.on('adduser', (data) => {
//     socket.broadcast.emit('adduser', data, socket.id)
//     let userData = {
//       data: data
//     }
//     users.push(userData)
//     checkHost();

//     if (users.length <= 10 && users.length > 0 && botActive == false) {
//       // the host has joined
//       addbots();
//       botActive = true;
//     }
//     if (!data.id.startsWith('bot') && botActive == true && users.length >= 2) {
//       console.log('new additional user ' + data.id)
//        removebot(); // hier gaat hij op z'n bek
//     }
//   })


//   function addbots() {
//     io.to(host).emit('addbots', users);
//     console.log('sending emit to ' + host)
//   }

//   function removebot() {
//     // console.log('removing bot')
//     let bot = users.find(userList => {
//       return userList.data.id.startsWith('bot')
//     })
//     // maar wat als er geen bots meer zijn
//     users = users.filter(target => target.data.id != bot.data.id)
//     io.to(host).emit('removebot', users)
//     io.emit('removeuser', users)
//   }

//   function checkHost() {
//     // console.log('check host')
//     if (host == undefined) {
//       let user = users.filter(userList => {
//         return !userList.data.id.startsWith('bot');
//       })
//       console.log(user)
//       host = user[0].data.id;

//     }
//   }


//   socket.on('updateuser', function (user) {
//     let target = users.find(userList => {
//       return userList.data.id == user.id
//     })
//     // single responsability pattern missing
//     if(!target){
//       // event emit om de host te laten weten dat de bot niet meer bestaat, hoeft niet want dat doe ik ergens anders al (brain food) 86
//       return
//     }
//     // console.log(users)
//     target.data.x = user.x;
//     target.data.y = user.y;
//     target.data.color = user.color;
//     if (target.data.velocity) {
//       // target.data.velocity  = user.velocity
//       target.data.velocity  = user.velocity
//     }
//     // console.log('location emit')
//     io.emit('updatelocations', users)
//   })




//   socket.on('disconnect', function () {
//     socket.id;
//     users = users.filter(user => user.data.id != socket.id)
//     socket.broadcast.emit('removeuser', users)
//     if (host == socket.id) {
//       console.log('the host has left')
//       host = undefined;
//       // checkHost();
//     }
//     addbots();

//   });

// });




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