'use strict';

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("area")[0];
    let ctx = canvas.getContext('2d');
    let radius = 50;

    //client dot
    let client = {
        id: null,
        x: 0,
        y: 0
    }

    // handling canvas size
    window.addEventListener('resize', onResize, false);
    //set the canvas size on initialise
    onResize();

    //Move the user on keypresses
    window.onkeydown = function(e){
        if(e.key == "a"){
            client.x -= 10;
        }
        if(e.key == "s"){
            client.y += 10;
        }
        if(e.key == "d"){
            client.x += 10;
        }
        if(e.key == "w"){
            client.y -= 10;
        }


        socket.emit('updateuser', client)

    }

    //User needs to get other user data on connection so that we an place all the users
    socket.on('greet', function (data, id) {
        //userId = id;
   
        // prevent overlap
        // let clientX = Math.floor(Math.random() * Math.floor(canvas.width));
        // let clientY =  Math.floor(Math.random() * Math.floor(canvas.height));
        let clientX = randomIntFromRange(radius, canvas.width - radius);
        let clientY = randomIntFromRange(radius, canvas.height - radius);

        for (let i = 0; i < data.length; i++) {
            console.log(data[i].data)
            if(distance(clientX, clientY, data[i].data.x, data[i].data.y) - radius * 2 < 0){
                 clientX = randomIntFromRange(radius, canvas.width - radius);
                 clientY = randomIntFromRange(radius, canvas.height - radius);

                 i = -1;
            }
        }

        
        let clientPosition = {
            x: clientX,
            y: clientY,
            id: id
        }
        client.id = clientPosition.id;
        client.x = clientPosition.x;
        client.y = clientPosition.y;
        
        // add the client user
        addUser(clientPosition, true)

        //if there are users in on the server show them
        for (let i = 0; i < data.length; i++) {
            addUser(data[i].data, false)
        }
    });


    //the server tells the  client that there is another user, data contains user location 
    socket.on('adduser', function (data) {
        addUser(data, false);
        console.log(data)
    })

    //the server tells the client someone disconnected, redraw the canvas without that user
    socket.on('removeuser', function (data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.length; i++) {
            addUser(data[i].data, false)

        }
    })

    // when a user is moving
    socket.on('updatelocations', function(users){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < users.length; i++) {
             addUser(users[i].data, false)
        }

        // voor de collision detection kan ik me user ide gebruiken om te achterhalen welk stipje de client is

        for (let i = 0; i < users.length; i++) {
            // voorkomt collision check met zichzelf
            if(client.id === users[i].data.id){
                continue;
            }
            // collision check
            if(distance(client.x, client.y, users[i].data.x, users[i].data.y) - radius * 2 < 0){
                console.log('collision detected')
           }

        }
    })

    // draw the user
    function addUser(data, emit) {

        let x = data.x;
        let y = data.y;


        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#F03C69';
        ctx.fill();

        // sends location to the server
        if (!emit) {
            return;
        }
        socket.emit('adduser', {
            x: x,
            y: y,
            id: data.id
        })
    }

    // utility function from https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js
    function randomIntFromRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // utility function from https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js
    function distance(x1, y1, x2, y2) {
        const xDist = x2 - x1
        const yDist = y2 - y1

      //https://nl.wikipedia.org/wiki/Stelling_van_Pythagoras
        return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
      }
      

    //window has been resized make an new canvas, user can ben outside of the view :P
    function onResize() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

})();


// Todo
// voorkom movement buiten het canvas
// voeg bots toe die een random velocity krijgen
// laat de bots bouncen als ze uit het de canvas width gaan
// hoeveelheid bots laten bepalen op basis van de coronavirus data
// resize herberekening