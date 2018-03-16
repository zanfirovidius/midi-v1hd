var express = require('express');
var socket = require('socket.io');
var easymidi = require('easymidi');

var app = express();

server = app.listen(8080, function() {
  console.log('server is running on port 8080');
});

io = socket(server);

var input = new easymidi.Input('V-1HD');

input.addListener('cc', msg => {
  io.emit('RECEIVE_MESSAGE', msg);
});
input.addListener('program', msg => {
  io.emit('RECEIVE_MESSAGE', msg);
});
