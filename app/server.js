// The Server
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || 3000);
// Make sure our scripts and styles can be seen.
app.use(express.static("public"));
console.log("server running");

var socket = require("socket.io");
var io = socket(server);
var online = 0;
var sequence = 0;
var users = {};
exports.num = online;

// web sockets.
io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection /' + socket.id);
  online ++;
  sequence ++;
  console.log('Online Users: '+online);
  io.emit('onlineNum', online);
  //assign index to new User
  io.to(socket.id).emit('indexNum', sequence);
  //receive trigger from client and broadcast to all others
  socket.on('trigger', Msg);
  function Msg(data) {
    socket.broadcast.emit('trigger', data);
    console.log(data);
  }
    //client disconnect 
  socket.on('disconnect', disConnection);
  function disConnection(socket) {
  online --;
  console.log('Online Users: '+online);
  io.emit('onlineNum', online);
}
}


