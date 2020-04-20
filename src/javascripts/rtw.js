'use strict';

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("area")[0];
    let ctx = canvas.getContext('2d');
    //let userId;

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

        let clientPosition = {
            x: Math.floor(Math.random() * Math.floor(canvas.width)),
            y: Math.floor(Math.random() * Math.floor(canvas.height)),
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
    })

    // draw the user
    function addUser(data, emit) {
        let radius = 25;
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



    //window has been resized make an new canvas, user can ben outside of the view :P
    function onResize() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

})();