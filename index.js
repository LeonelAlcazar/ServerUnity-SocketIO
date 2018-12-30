var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');
console.log('Server started');

var Players = [];



io.on('connection', function(socket){
	var thisClientId = shortid.generate();

	Players.push(thisClientId);

	console.log('client connected, id:',thisClientId);

	socket.broadcast.emit('spawn', { id: thisClientId });
	Players.forEach(function(playerId){
		if(playerId == thisClientId)
			return;

		socket.emit('spawn', {id: playerId});

	});

	socket.on('disconnect',function(){
		console.log("Client disconnect");
		Players.splice(Players.indexOf(thisClientId), 1);

		socket.broadcast.emit('disconnected', { id: thisClientId });
	});

	socket.on('PosRefresh',function(data){
		console.log('client PosRefresh, id:',thisClientId);
		data.id = thisClientId;
		socket.broadcast.emit('PlayerPosRefresh',data);
	});

	socket.on('Shoot',function(data){
		console.log(thisClientId + " is Shooting");
		socket.broadcast.emit('Shooting', data);
	});
})