'use strict';

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("area")[0];
    let ctx = canvas.getContext('2d');
    let playerList;
    let playerId;
    
    socket.on('getId', function(id){
        playerId = id;
        console.log('Welcome ' + playerId)
    })
    
    socket.on('drawPlayers', function(players){
        playerList = [];
        for(let i = 0; i < players.length; i++){
            playerList.push(new Player(players[i].position.x, players[i].position.y, players[i].radius, players[i].color, players[i].id))
        }

             drawCanvas();
    })

    class Player {
        constructor(x, y, radius, color, id){
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.id = id;
        }

        draw(){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        update(){
            this.draw()
        }
        
        move(x, y){
          this.x = this.x + x;
          this.y = this.y + y;

          let playerData = {
              id: this.id,
              position: {
                  x: this.x,
                  y: this.y
              }
          }
          socket.emit('updateLocations', playerData);
        }
    }

        //Move the user on keypresses
    window.onkeydown = function (e) {
        let controllable = playerList.find(player => player.id == playerId)
        if (e.key == "a") {
            if (controllable.x >= (0 + controllable.radius)) {
               controllable.move(-10, 0)
            }
        }
        if (e.key == "s") {
            if (controllable.y <= (canvas.height - controllable.radius)) {
                controllable.move(0, 10)
            }
        }
        if (e.key == "d") {
            if (controllable.x <= (canvas.width - controllable.radius)) {
                controllable.move(10, 0)
            }
        }
        if (e.key == "w") {
            if (controllable.y >= (0 + controllable.radius)) {
                controllable.move(0, -10)
            }
        }
    }

    function drawCanvas(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Player.update();
        playerList.forEach(player => {
            player.update();
        })

        requestAnimationFrame(drawCanvas)
    }



    // let radius = 50;
    // let defaultColor = '#F03C69';
    // let botColor = '#82A0C2';
    // let movementAnimation;

    //client dot
    // let client = {
    //     id: null,
    //     x: 0,
    //     y: 0,
    //     color: defaultColor
    // }

    // handling canvas size
    // window.addEventListener('resize', onResize, false);
    //set the canvas size on initialise
    // onResize();



    //User needs to get other user data on connection so that we an place all the users
    // socket.on('greet', function (data, id) {
    //     //userId = id;

    //     // prevent overlap
    //     let clientX = randomIntFromRange(radius, canvas.width - radius);
    //     let clientY = randomIntFromRange(radius, canvas.height - radius);

    //     for (let i = 0; i < data.length; i++) {
    //         if (distance(clientX, clientY, data[i].data.x, data[i].data.y) - radius * 2 < 0) {
    //             clientX = randomIntFromRange(radius, canvas.width - radius);
    //             clientY = randomIntFromRange(radius, canvas.height - radius);

    //             i = -1;
    //         }
    //     }


    //     let clientPosition = {
    //         x: clientX,
    //         y: clientY,
    //         id: id,
    //         color: client.color
    //     }
    //     client.id = clientPosition.id;
    //     client.x = clientPosition.x;
    //     client.y = clientPosition.y;

    //     // add the client user
    //     addUser(clientPosition, true)

    //     //if there are users in on the server show them
    //     for (let i = 0; i < data.length; i++) {
    //         addUser(data[i].data, false)
    //     }
    // });


    //the server tells the  client that there is another user, data contains user location 
    // socket.on('adduser', function (data) {
    //     addUser(data, false);
    //     console.log(data)
    // })

    //the server tells the client someone disconnected, redraw the canvas without that user
    // socket.on('removeuser', function (data) {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     for (let i = 0; i < data.length; i++) {
    //         addUser(data[i].data, false)

    //     }
    // })

    // when a user is moving
    // socket.on('updatelocations', function (users) {
    //     // console.log('locations updated')
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     for (let i = 0; i < users.length; i++) {
    //         addUser(users[i].data, false)
    //     }

    //     for (let i = 0; i < users.length; i++) {
    //         // voorkomt collision check met zichzelf
    //         if (client.id === users[i].data.id) {
    //             continue;
    //         }
    //         // collision check
    //         if (distance(client.x, client.y, users[i].data.x, users[i].data.y) - radius * 2 < 0) {
    //             // console.log('collision detected with ' + users[i].data.id)

    //             // // collision with bot
    //             if (users[i].data.id.startsWith('bot') && client.color == "#4ef542" && users[i].data.color == botColor) {
    //                 users[i].data.color = "#4ef542";
    //                 socket.emit('updateuser', users[i].data)
    //             }

    //             // infect player
    //             if (users[i].data.color == "#4ef542" && client.color == defaultColor) {
    //                 client.color = users[i].data.color;

    //                 socket.emit('updateuser', client)
    //             }

    //         }

    //     }
    // })

    // socket.on('addbots', function (data) {
    //     let nmbr;
    //     let dots = [];
    //     dots.push(client)

    //     // console.log(data.data) deze moet ook aan de array toegevoegd worden zodra bots geadd kunnen worden op user disconnect

    //     if (data.length <= 10) {
    //         nmbr = 10 - data.length;
    //     }

    //     console.log(nmbr)

    //     for (let j = 0; j < nmbr; j++) {
    //         let botX = randomIntFromRange(radius, canvas.width - radius);
    //         let botY = randomIntFromRange(radius, canvas.height - radius);

    //         for (let i = 0; i < dots.length; i++) {
    //             if (distance(botX, botY, dots[i].x, dots[i].y) - radius * 2 < 0) {
    //                 botX = randomIntFromRange(radius, canvas.width - radius);
    //                 botY = randomIntFromRange(radius, canvas.height - radius);

    //                 i = -1;
    //             }
    //         }

    //         let botPosition = {
    //             x: botX,
    //             y: botY,
    //             id: 'bot' + makeid(10),
    //             color: botColor,
    //             velocity: {
    //                 x: Math.random() - 0.5,
    //                 y: Math.random() - 0.5
    //             }
    //         }

    //         dots.push(botPosition)
    //         addUser(botPosition, true)
    //     }

    //     moveBots(dots)
    // })


    // socket.on('removebot', function (users) {
    //     let newBots = users.filter(userList => {
    //         return userList.data.id.startsWith('bot')
    //     })

    //     let bots = newBots.map(index => {
    //         return index.data
    //     })

    //     cancelAnimationFrame(movementAnimation);
    //     // hier ergens gaat het mis :(
    //     moveBots(bots)
    //     // moveThebots(bots) kan ook
    // })

    // function moveBots(data) {
    //     // console.log("move bots is called")
    //     // get all the bots
    //     let bots = data.filter(userList => {
    //         return userList.id.startsWith('bot')
    //     })

    //     moveThebots(bots)
    // }

    // function moveThebots(bots) {
    //     for (let i = 0; i < bots.length; i++) {
    //         // flip te velocity if it bounces to the wall
    //         if (bots[i].x - radius <= 0 || bots[i].x + radius >= canvas.width) {
    //             bots[i].velocity.x = -bots[i].velocity.x
    //         }
    //         if (bots[i].y - radius <= 0 || bots[i].y + radius >= canvas.height) {
    //             bots[i].velocity.y = -bots[i].velocity.y
    //         }
    //         // the actual movement
    //         bots[i].x += bots[i].velocity.x;
    //         bots[i].y += bots[i].velocity.y;



    //         //let the server know about our new location
    //         // console.log('emitting ' + bots[i].id)
    //         // console.log(bots)
    //         socket.emit('updateuser', bots[i])
    //     }
    //     movementAnimation = requestAnimationFrame(function () {
    //         moveThebots(bots)
    //     })
    // }



    // draw the user
//     function addUser(data, emit) {
//         let x = data.x;
//         let y = data.y;
//         let color = data.color;


//         ctx.beginPath();
//         ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
//         ctx.fillStyle = color;
//         ctx.fill();

//         // sends location to the server
//         if (!emit) {
//             return;
//         }

//         // if user
//         console.log(data.id)
//         if(!data.id.startsWith('bot')){
//         socket.emit('adduser', {
//             x: x,
//             y: y,
//             id: data.id,
//             color: color
//         })
//     }
//     else{
//         // bot
//         socket.emit('adduser', {
//             x: x,
//             y: y,
//             id: data.id,
//             color: color,
//             velocity: {
//                 x: data.velocity.x,
//                 y: data.velocity.y
//             }
//         })
//     }
// }




    // utility function from https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js
    // function randomIntFromRange(min, max) {
    //     return Math.floor(Math.random() * (max - min + 1) + min)
    // }

    // utility function from https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js
    // function distance(x1, y1, x2, y2) {
    //     const xDist = x2 - x1
    //     const yDist = y2 - y1

    //     //https://nl.wikipedia.org/wiki/Stelling_van_Pythagoras
    //     return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
    // }


    //window has been resized make an new canvas, user can ben outside of the view :P
    // function onResize() {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    // }

    // // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    // function makeid(length) {
    //     var result = '';
    //     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //     var charactersLength = characters.length;
    //     for (var i = 0; i < length; i++) {
    //         result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //     }
    //     return result;
    // }

})();


// Todo
// zorg ervoor dat de client een movement update krijgt wanneer een bot weg gehaald word, je kan geen bots bewegen die er niet meer zijn
// hoeveelheid bots laten bepalen op basis van de coronavirus data
// ziekte mechanic
// readme fixen