# Corona Social experiment.
![Preview image of the application](https://github.com/Ramon96/real-time-web-1920/blob/master/readme-resources/appPreview.png?raw=true)

<!-- Add a link to your live demo in Github Pages 🌐-->
## Link to live demo:
[Demo](https://rule-the-world.herokuapp.com/social)

<!-- ☝️ replace this description with a description of your own work -->
## Description
Even tho it looks like an game, you cant win or lose. The idea is to see if people will keep distance when they are a different color and notice they can infect others with their color. Or if they want to spread it. It is also intressting to see if people who are not infected if they try to keep their distance with other users

<!-- Maybe a table of contents here? 📚 -->
## Table of content
- [Corona Social experiment.](#corona-social-experiment)
  * [Link to live demo:](#link-to-live-demo-)
  * [Description](#description)
  * [Installation](#installation)
  * [Features](#features)
    + [Moving around](#moving-around)
    + [Infecting](#infecting)
  * [Data life cycle](#data-life-cycle)
  * [Data model on the server](#data-model-on-the-server)
  * [Socket events](#socket-events)
    + [getId](#getid)
    + [drawPlayers](#drawplayers)
    + [updatelocations](#updatelocations)
    + [Connect](#connect)
    + [Disconnect](#disconnect)
  * [Wishlist](#wishlist)
  * [Known issue's](#known-issue-s)
  * [Sources](#sources)
  * [License](#license)

<!-- How about a section that describes how to install this project? 🤓 -->
## Installation
Clone the project

```
git clone https://github.com/Ramon96/real-time-web-1920.git
```

Navigate in the right folder

```
cd /real-time-web-1920
```


Run the project

```
nodemon
```

<!-- ...but how does one use this project? What are its features 🤔 -->
## Features
When reffered to players I refer to Users and bots collectively.
Users are real life players. 
And bots move around randomly.


### Moving around
The server keeps track of all player locations and allows players to move around using the **asdw** keys
Whenever the client presses one of these keys, their user data will be send to the server with updatelocations emit

```js 
socket.emit('updateLocations', playerData);
```

However bots move around differenly.
Every bot as a random velocity, this velocity updates their X and Y position.
When the bot hits an wall then their velocity will be flipped.

```js
// bot movment
  move() {
    if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= gameMap.width) {
      this.velocity.x = -this.velocity.x
    }
    if (this.position.y - this.radius <= 0 || this.position.y + this.radius >= gameMap.height) {
      this.velocity.y = -this.velocity.y
    }
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
```


### Infecting
There are 2 ways an player can get sick.

1. at random 
When there are no players that are sick then the server wil pick one at random from the playerlist and make that person/bot sick.

```js
function makeRandomPlayerSick() {
  const sharedList = [...userList, ...botList];
  const randomIndex = Math.floor(Math.random() * (sharedList.length));
  if(sharedList[randomIndex].isSick == false){
  sharedList[randomIndex].makePlayerSick();
  recover(sharedList[randomIndex])
  io.emit('drawPlayers', [...userList, ...botList])
}
}
```

2. by collision.
The server checks the distance between the sick player and every other dots.
This is done with pythagoras theorem and looks a little like this.

```js

function onMovement(player) {
  if (player.isSick) {
    // checks if the player collided with another player
    getCollidingPlayers(player).forEach(collidedPlayer => {
      if(collidedPlayer.isSick == false){
      collidedPlayer.makePlayerSick();
      recover(collidedPlayer);
      }
    })

  }
}

function getCollidingPlayers(target) {

  let combinedList = [...userList, ...botList];
  return combinedList.filter(index => {
      if (index.id == target.id) {
          return false;
      }
      return (distance(index.position.x, index.position.y, target.position.x, target.position.y) < target.radius * 2)
  });
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1
  const yDist = y2 - y1

  //https://nl.wikipedia.org/wiki/Stelling_van_Pythagoras
  // return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
  return Math.abs(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)))
}


``` 

<!-- What external data source is featured in your project and what are its properties 🌠 -->


<!-- This would be a good place for your data life cycle ♻️-->
## Data life cycle
![Datalifecycle](https://github.com/Ramon96/real-time-web-1920/blob/master/readme-resources/b06c5197-74f0-434b-b0ab-2a7bf4a5cf5e.jpg?raw=true)

## Data model on the server
The server keeps track of all the important data which means that the server has the single source of truth. 
The server has the *Game Settings*

```js
// Size of the circle
const playerRadius = 50;

// This changes the setInterval time speed of the bot movement, lower results in more lagg
const botInterval = 16;

const gameMap = {
  width: 980,
  height: 750
};
```

It also holds the blue prints for the players, this extends to the users and bots

```js
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
    this.color = '#F03C69';
  }

  makePlayerSick() {
    this.isSick = true;
    this.color = '#4ef542';
  }

  cure(){
    this.isSick = false;
    this.color = '#F03C69';
  }

}

// Controllable player settings
class defaultUserData extends defaultPlayerData {
  constructor(id, position, isSick, radius, color) {
    super(id, position, isSick, radius, color);
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
  cure(){
    this.isSick = false;
    this.color = '#82A0C2';
  }

  move() {
    if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= gameMap.width) {
      this.velocity.x = -this.velocity.x
    }
    if (this.position.y - this.radius <= 0 || this.position.y + this.radius >= gameMap.height) {
      this.velocity.y = -this.velocity.y
    }
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}
```

and to round it all of, the full list of users and bots (with their position, velocity's, colors and decease status)

```js
// List containing all the controllable players
let userList = [];
// List  containing all the bots
const botList = [];
```


## Socket events

### getId
This is our first handshake with the client. It is used to let the client know who he/she is of all the dots
```js
    socket.on('getId', function(id){
        playerId = id;
        console.log('Welcome ' + playerId)
    })
```

### drawPlayers
This function is the bread and butter in this project. This socket event is used to let all the clients know that changes are made on the server and that the client needs to update the drawings. This updates can be

- adding players
- removing players
- moving players
- changing player colors

```js 
    socket.on('drawPlayers', function(players){
        playerList = [];
        console.log('emit')
        for(let i = 0; i < players.length; i++){
            playerList.push(new Player(players[i].position.x, players[i].position.y, players[i].radius, players[i].color, players[i].id))
        }

        let controllable = playerList.find(player => player.id == playerId)
        if(controllable.color != '#4ef542'){
            controllable.color = '#FF2D00'
        }

        if(!canvasDrawn){
        drawCanvas();
        canvasDrawn = true;
        }
    })
```


### updatelocations
When an player moves, the server needs to update their x and Y coordinate. 
The server needs to know is who moved. The server will then update this person's x and y coordinates and save it in the data model 
```js
  socket.on('updateLocations', function (playerData) {
    let targetPlayer = userList.find(player => player.id == playerData.id)
    targetPlayer.position.x = playerData.position.x;
    targetPlayer.position.y = playerData.position.y;
    onMovement(targetPlayer)
    io.emit('drawPlayers', [...userList, ...botList])
  })
```

### Connect
When an user connects the follow flow will occur

First the server will add the user to the user list and let the user know who he is.
```
  registerUser(socket.id)
  socket.emit('getId', socket.id);
```

Then the server will give the client the information it needs to draw the canvas (all the players with all their data)

```
  // give the client the dots to draw
  io.emit('drawPlayers', [...userList, ...botList])
```

Then the server will check if bots needs to be removed, it will do so by removing 1 bot when there is a bot in the botlist to remove
Then it will check if bots needs to be added this is needed when the first user joins and there are no bots present.
then if there are bots the server will handle the bot movment. 
and finally the server will check if someone is sick, in case no one is sick then the server will make a random player sick.

```js
  removeBots();
  addBots();
  if(botList.length > 0){
    moveBots();
  }
  checkSickness()
```

### Disconnect 
When an user is disconnected, that user will be removed from the userlist, a bot is added and the clients will be notified to redraw the canvas without the bot.

```js 
  socket.on('disconnect', function () {
    // Remove disconnected player from the userlist
    userList = userList.filter(user => {
      return user.id != socket.id
    })
    addBots();
    io.emit('drawPlayers', [...userList, ...botList])

    console.log(socket.id + ' has disconnected');
  });
```

<!-- Maybe a checklist of done stuff and stuff still on your wishlist? ✅ -->
## Wishlist
- [x] Collition detection.
- [x] Random decease when no one is sick.
- [x] Single player experience.
- [ ] Rooms per country using the corona virus api.
- [x] Preventing players from walking outside the canvas
- [x] scaling the canvas (or forcing a certain width)
- [ ] Obstacles
- [ ] Oath, using your picture as your player pawn


## Known issue's
* The peformence is tied to the server peformance.
* There is no room limit yet, when there is no available space for a new user the app will crash (It will try to find a space until on comes available)

## Sources 
* Guido, he helped me set up psuedo code function that I could use to make my client sided application more server sided. He also showed me the power of using classes and going for an object oriented approach, and helped me think like an game developer and showing how a game flow should look like on the server.

Here is the psuedo code we wrote 
```js 
const playerRadius = 50;
const gameMap = {
  width: 500,
  height: 500
};
const defaultPlayerData = {
  id: 0,
  position: {
    x: 0,
    y: 0
  },
  isSick: false,
};
const defaultUserData = {
  ...defaultPlayerData,
};
const defaultBotData = {
  ...defaultPlayerData,
  velocity: {
    x: 0,
    y: 0,
  }
};
const userList = [];
const botList = [];
function makePlayerSick(player) {
  player.isSick = true;
}
makePlayerSick(user);
function makeRandomPlayerSick() {
  const sharedList = [...userList, ...botList];
  const randomIndex = Math.floor(Math.random() * (sharedList.length));
  makePlayerSick(sharedList[randomIndex]);
  syncData();
}
function makeRandomUserSick() {
  const randomIndex = Math.floor(Math.random() * (userList.length));
  makePlayerSick(userList[randomIndex]);
  syncData();
}
function syncData() {
  io.emit('sync data', userList, botList);
}
```

* Cris courses, His video tutorial showed me how you can achieve collition detection using pythagoras theorem. https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js
These are the functions used in this project

```js
function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1
  const yDist = y2 - y1

  return Math.abs(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)))
}

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
```

I used a stackoverflow function to make unique id's for the bots
https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
```js 
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return 'bot' + result;
}
```

<!-- How about a license here? 📜  -->
## License
[MIT](https://github.com/Ramon96/real-time-web-1920/blob/master/LICENSE)
