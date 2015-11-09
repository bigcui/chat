function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemConcentElement(message) {
    return $("<div></div>").html('<i> ' + message + '</i>');
}

function processUserInput(chatApp, socket) {
    var message = $('#message').val();
    var systemMessage;
    if (message.chatAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSystemConcentElement(systemMessage));
        }
    } else {
        chatApp.sendFile($('#room').text(), message);
        $('#message').append(divEscapedContentElement(message));
        $('#message').scrollTop($('#message').prop('scrollHeight'));
    }
    $("#send-message").val();
}

//   客户端
var socket = io.connect();
$(dicument).ready(function() {
    var chatApp = new chat('socket');
    socket.on('nameResult', function(result) {
        var message;
        if (result.success) {
            message = 'you are now know as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $("#message").append(divSystemConcentElement(message));
    });
    socket.on('jionResult', function(result) {
        $('#room').text(result.room);
        $('#message').append(divEscapedContentElement('room changed.'));
    });

    socket.on('message', function(message) {
        var newElement = $('<div></div>').text(message.text);
        $('#message').append(newElement);
    });
    socket.on('rooms', function(rooms) {
        $('#room-list').empty();
        for (var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
    });
    $('#room-list div').click(function() {
        chatApp.processCommand('/join' + $(this).text());
        $('#send-message').focus();
    });
});
setIntever(function() {
    socket.emit('rooms');
}, 1000);
$('#send-message]').focus();
$('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
});