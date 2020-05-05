'use strict';

(function () {
    let socket = io();
    let canvas = document.getElementsByClassName("area")[0];
    let ctx = canvas.getContext('2d');
    let playerList;
    let playerId;
    let canvasDrawn = false;
    
    socket.on('getId', function(id){
        playerId = id;
        console.log('Welcome ' + playerId)
    })
    
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

})();

// Todo
// client makkelijker kunnen identifceren