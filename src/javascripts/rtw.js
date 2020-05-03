'use strict';

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("area")[0];
    let ctx = canvas.getContext('2d');
    let radius = 50;
    let defaultColor = '#F03C69';
    let botColor = '#82A0C2';

    //client dot
    let client = {
        id: null,
        x: 0,
        y: 0,
        color: defaultColor
    }

    // handling canvas size
    window.addEventListener('resize', onResize, false);
    //set the canvas size on initialise
    onResize();

    //Move the user on keypresses
    window.onkeydown = function (e) {
        if (e.key == "a") {
            if (client.x >= (0 + radius)) {
                client.x -= 10;
            }
        }
        if (e.key == "s") {
            if (client.y <= (canvas.height - radius)) {
                client.y += 10;
            }
        }
        if (e.key == "d") {
            if (client.x <= (canvas.width - radius)) {
                client.x += 10;
            }
        }
        if (e.key == "w") {
            if (client.y >= (0 + radius)) {
                client.y -= 10;
            }
        }

        if (e.key == "k") {
            client.color = "#4ef542";
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
            if (distance(clientX, clientY, data[i].data.x, data[i].data.y) - radius * 2 < 0) {
                clientX = randomIntFromRange(radius, canvas.width - radius);
                clientY = randomIntFromRange(radius, canvas.height - radius);

                i = -1;
            }
        }


        let clientPosition = {
            x: clientX,
            y: clientY,
            id: id,
            color: client.color
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
    socket.on('updatelocations', function (users) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < users.length; i++) {
            addUser(users[i].data, false)
        }

        for (let i = 0; i < users.length; i++) {
            // voorkomt collision check met zichzelf
            if (client.id === users[i].data.id) {
                continue;
            }
            // collision check
            if (distance(client.x, client.y, users[i].data.x, users[i].data.y) - radius * 2 < 0) {
                console.log('collision detected with ' + users[i].data.id)

                // if (users[i].data.color != defaultColor && client.color == defaultColor && users[i].data.color != botColor) {
                //     client.color = users[i].data.color;
                //     socket.emit('updateuser', client)
                // }

                // collision with bot
                if(users[i].data.id.startsWith('bot') && client.color == "#4ef542" && users[i].data.color == botColor){
                    users[i].data.color = "#4ef542";
                    console.log(users[i].data.color)
                    socket.emit('updateuser', users[i].data)


                }
                // infect player
                if (users[i].data.color == "#4ef542" && client.color == defaultColor) {
                    client.color = users[i].data.color;

                    socket.emit('updateuser', client)
                }

            }

        }
    })

    socket.on('addbots', function (data) {
        let nmbr;
        let dots = [];
        dots.push(client)

        // console.log(data.data) deze moet ook aan de array toegevoegd worden zodra bots geadd kunnen worden op user disconnect

        if(data.length <= 10){
            nmbr =  10 - data.length ; 
        }

        console.log(nmbr)
        
        for (let j = 0; j < nmbr; j++) {
            let botX = randomIntFromRange(radius, canvas.width - radius);
            let botY = randomIntFromRange(radius, canvas.height - radius);

            for(let i = 0; i < dots.length; i++){
                if (distance(botX, botY, dots[i].x, dots[i].y) - radius * 2 < 0) {
                    botX = randomIntFromRange(radius, canvas.width - radius);
                    botY = randomIntFromRange(radius, canvas.height - radius);

                    i = -1;
                }
            }


            let botPosition = {
                x: botX,
                y: botY,
                id: 'bot' + makeid(10),
                color: botColor
            }

            dots.push(botPosition)

            addUser(botPosition, true)
        }
    })


    // draw the user
    function addUser(data, emit) {
        let x = data.x;
        let y = data.y;
        let color = data.color;


        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();

        // sends location to the server
        if (!emit) {
            return;
        }
        socket.emit('adduser', {
            x: x,
            y: y,
            id: data.id,
            color: color
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

    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

})();


// Todo
// voeg bots toe die een random velocity krijgen 
// laat de bots bouncen als ze uit het de canvas width gaan
// hoeveelheid bots laten bepalen op basis van de coronavirus data
// resize herberekening