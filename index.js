var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');
console.log('Server started');

var Players = [];

var Cars = [
	{
		"id":"0",
		"driver":"none",
		"inUse":"false",
		"x":"4,00",
		"y":"0,5",
		"z":"0",
		"rx":"0",
		"ry":"0",
		"rz":"0",
	}
];



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
	Cars.forEach(function(car){
		if(car.driver == thisClientId)
			return;

		socket.emit('CarServerRefresh',car);
	});

	socket.on('disconnect',function(){
		console.log("Client disconnect");
		Players.splice(Players.indexOf(thisClientId), 1);

		socket.broadcast.emit('disconnected', { id: thisClientId });
	});

	socket.on('PosRefresh',function(data){
		data.id = thisClientId;
		socket.broadcast.emit('PlayerPosRefresh',data);
	});

	socket.on('Shoot',function(data){
		console.log(thisClientId + " is Shooting");
		socket.broadcast.emit('Shooting', data);
	});
	
	socket.on('CarRefresh',function(data){
		data.driver = thisClientId;
		Cars.forEach(function(car){
			if(car.id == data.id)
				car = data;
				return;
		});
		socket.broadcast.emit('CarServerRefresh', data);
	});

	socket.on('CloseCar',function(data){
		data.driver = thisClientId;
		Cars.forEach(function(car){
			if(car.id == data.id){
				console.log("car {0} is closed ({1})", data.id, car.id);
				car.inUse = "false";
				socket.broadcast.emit('CarServerRefresh', car);
				return;
			}
		});
		
	});
})