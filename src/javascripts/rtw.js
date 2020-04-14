'use strict';

(function(){
    let socket = io();
    let canvas = document.getElementsByClassName("area")[0];
    let ctx = canvas.getContext('2d');
    let userId;

    // handling canvas size
    window.addEventListener('resize', onResize, false);
    onResize();

    //User needs to get other user data on connection so that we an place all the users
    socket.on('greet', function(data, id){
        // console.log(data)
        userId = id;

        let clientPosition = {
        x : Math.floor(Math.random() * Math.floor(canvas.width)),
        y : Math.floor(Math.random() * Math.floor(canvas.height))
        }


        // add the client user
        addUser(clientPosition, true)
        console.log(data)


        //there are users in on the server show them
        for (let i = 0; i < data.length; i++) {
            console.log(data[i].data)
            addUser(data[i].data, false)
            
        }
    }); 





    // notices that there is another user, data contains user location
    socket.on('adduser', function(data){
        addUser(data, false);
        
    })

    socket.on('removeuser', function( data){
        console.log('user gonee net als mijn geluk')
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.length; i++) {
            addUser(data[i].data, false)
            
        }
    })
    
    // makes user on the client
    
    function addUser(data, emit){
        let radius = 25;
        let x = data.x;
        let y = data.y;

        console.log(data)
    

    //     console.log('ik draw een user op ' +  x + " " + y)
         ctx.beginPath();
         ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
         ctx.fillStyle = '#F03C69';
         ctx.fill();

    // sends location to the server
        if (!emit) { return; }
        socket.emit('adduser', {
            x: x,
            y: y
        })
    }



    function onResize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

})();