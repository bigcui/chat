 var socketio = require('socket.io');
 var io;
 var guestNumber = 1;
 var nickNames = {};
 var namesUsed = {};
 var currentRoom = {};
 //确定链接逻辑
 exports.listen = function() {
     io = socketio.listen(server);
     io.set('log level', 1);

     io.socket.on('connection', function() {
         guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
         joionRoom(socket, 'Lobby');
         handleMessageBroadingcasting(socket, nickNames);
         handleNameChangeAttempts(socket, nickNames, namesUsed);
         handleRoomJoining(socket);
         socket.on("rooms", function() {
             socket.emit('rooms', io.socket.manager.rooms);
         });
         handleClientDisconnection(socket, nickNames, namesUsed);

     });
 };
 // 分配用户昵称
 function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
     var name = "Guest" + guestNumber;
     nickNames[socket.id] = name;
     socket.emit('nameResult', {
         success: true,
         name: name
     });
     namesUsed.push(name);
     return guestNumber + 1;
 }
 // 进入聊天室
 function joinRoom(socket, room) {
     socket.jion(room);
     currentRoom[socket.id] = room;
     socket.emit('jionResult', {
         room: room
     });
     socket.broadcast.to(room).emit('message', {
         text: nickNames[socket.id] + 'has joined' + room + '.'
     });
     var usersInRoom = io.socket.clients(room);
     if (usersInroom.length > 0) {
         var usersInRoomSummary = 'User currently in ' + room + ':';
         for (var index in usersInRoom) {
             var userSocketId = usersInRoom[index].id;
             if (userSocketId != socket.id) {
                 if (index > 0) {
                     usersInRoomSummary += ',';

                 }
                 usersInRoomSummary += nickNames[userSocketId];

             }
         }
         usersInRoomSummary += '.';
         socket.emit('message', {
             text: usersInRoomSummary
         });
     }
 }