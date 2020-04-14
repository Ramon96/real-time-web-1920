(function () {
    let socket = io();
    let form = document.querySelector("#chatform");
    let input = document.querySelector('#m');
    let chatlog = document.querySelector('#messages');
    let username;

    document.querySelector('#username').addEventListener('blur', function(){
        setUsername();
    })



    form.addEventListener('submit', function (e) {
        e.preventDefault();
        socket.emit('chat message', input.value);
        input.value = "";
    })

    socket.on('chat message', function (msg) {
        let message = document.createElement('li');
        let textContent = document.createTextNode(msg);
        message.appendChild(textContent);
        chatlog.appendChild(message);
    })
})();