(function () {
    var socket = io();
    var form = document.querySelector("#chatform");
    var input = document.querySelector('#m');
    var chatlog = document.querySelector('#messages');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        socket.emit('chat message', input.value);
        input.value = "";
    })

    socket.on('chat message', function (msg) {
        var message = document.createElement('li');
        var textContent = document.createTextNode(msg);
        message.appendChild(textContent);
        chatlog.appendChild(message);
    })
})();