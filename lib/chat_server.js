 var socketio = require('socket.io');
 var io;
 var guestNumber = 1;
 var nickNames = {};
 var namesUsed = {};
 var currentRoom = {};
 //确定链接逻辑
 exports.listen = function(server) {
     io = socketio.listen(server);
     io.set('log level', 1);

     io.sockets.on('connection', function() {
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
 //更名请求的处理逻辑
 function handleNameChangeAttempts(socket, nickNames, namesUsed) {
     socket.on('nameAttempt', function(name) {
         if (name.indexOf('Guest') == 0) {

             socket.emit('nameResult',{
                 success: false,
                 message: 'Names cannot begin with "Guest".'
             });

         } else {

             if (namesUsed.indexOf(name) == -1) {
                 var previousName = nickNames[socket.id];
                 var previousNameIndex = namesUsed.indexOf(previousName);
                 namesUsed.push(name);
                 nickNames[socket.id] = name;
                 delete namesUsed[previousNameIndex];
                 socket.emit('nameResult', {
                     success: true,
                     name: name
                 });
                 socket.broadcast.to(currentRoom[socket.id]).emit('message' ,{
                     text: previousName + 'is now know as' + name + ','
                 });


             } else {
                 socket.emit('nameResult', {
                     success: false,
                     message: 'That name is already in use.'
                 });
             }
         }
     });

 }

 // 发送聊天消息

 function handleMessageBroadcasting(socket) {
     socket.on('message', function(message) {
         socket.broadcast.to(message.room).emit('message', {
             text:socket.nickNames[socket.id] + ':' + message.text
         });
     });
 }

 function handleRoomJoining(socket) {
     socket.on('join', function(room) {
         socket.leave(currentRoom[socket.id]);
         joinRoom(socket, room.newRoom);
     });
 }

 // 用户断开链接
 function handleClientDisconnection(socket) {
     socket.on('disconnect', function() {
         var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
         delete namesUsed[nameIndex];
         delete nickNames[socket.id];
     });
 }