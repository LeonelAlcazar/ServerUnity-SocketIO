var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');
console.log('Server started');

var Players = [];

var Cars = [
	{
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

var Ships = [
	{
		"driver":"none",
		"inUse":"false",
		"x":"-16,1",
		"y":"6,9",
		"z":"-30",
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
		console.log(car);
		var carA = {"id":Cars.indexOf(car),"driver":car.driver,"inUse":car.inUse,"x":car.x,"y":car.y,"z":car.z,"rx":car.rx,"ry":car.ry,"rz":car.rz};
		socket.emit('CarServerRefresh',carA);
	});
	Ships.forEach(function(ship){
		if(ship.driver == thisClientId)
			return;
		console.log(ship);
		var shipA = {"id":Ships.indexOf(ship),"driver":ship.driver,"inUse":ship.inUse,"x":ship.x,"y":ship.y,"z":ship.z,"rx":ship.rx,"ry":ship.ry,"rz":ship.rz};
		socket.emit('ShipServerRefresh',shipA);
	});

	socket.on('disconnect',function(){
		console.log("Client disconnect");
		Players.splice(Players.indexOf(thisClientId), 1);

		socket.broadcast.emit('disconnected', { id: thisClientId });

		Cars.forEach(function(car){
			if(car.driver == thisClientId){
				console.log("car {0} is closed ({1}) for diconnect", Cars.indexOf(car), thisClientId);
				car.inUse = "false";
				var carA = {"id":Cars.indexOf(car),"driver":car.driver,"inUse":car.inUse,"x":car.x,"y":car.y,"z":car.z,"rx":car.rx,"ry":car.ry,"rz":car.rz};
				socket.broadcast.emit('CarServerRefresh', carA);
				return;
			}
		});

		Ships.forEach(function(ship){
			if(ship.driver == thisClientId){
				console.log("ship {0} is closed ({1}) for diconnect", Ships.indexOf(ship), thisClientId);
				ship.inUse = "false";
				var shipA = {"id":Ships.indexOf(ship),"driver":ship.driver,"inUse":ship.inUse,"x":ship.x,"y":ship.y,"z":ship.z,"rx":ship.rx,"ry":ship.ry,"rz":ship.rz};
				socket.broadcast.emit('CarServerRefresh', shipA);
				return;
			}
		});
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
		for(var i = 0; i < Cars.length; i++){
			if(i == data.id){
				var carA = {"driver":data.driver,"inUse":data.inUse,"x":data.x,"y":data.y,"z":data.z,"rx":data.rx,"ry":data.ry,"rz":data.rz};
				Cars[i] = data;
			}
			
		}
		socket.broadcast.emit('CarServerRefresh', data);
	});
	socket.on('ShipRefresh',function(data){
		data.driver = thisClientId;
		for(var i = 0; i < Ships.length; i++){
			if(i == data.id){
				var ship = Ships[i];
				var shipA = {"driver":ship.driver,"inUse":ship.inUse,"x":ship.x,"y":ship.y,"z":ship.z,"rx":ship.rx,"ry":ship.ry,"rz":ship.rz};
				Ships[i] = shipA;
			}
			
		}
		socket.broadcast.emit('ShipServerRefresh', data);
	});

	socket.on('CloseCar',function(data){
		data.driver = thisClientId;
		Cars.forEach(function(car){
			if(Cars.indexOf(car) == data.id){
				car.inUse = "false";
				var carA = {"id":Cars.indexOf(car),"driver":car.driver,"inUse":car.inUse,"x":car.x,"y":car.y,"z":car.z,"rx":car.rx,"ry":car.ry,"rz":car.rz};
				socket.broadcast.emit('CarServerRefresh', carA);
				return;
			}
		});
		
	});


	socket.on('CloseShip',function(data){
		data.driver = thisClientId;
		Ships.forEach(function(ship){
			if(Ships.indexOf(ship) == data.id){
				ship.inUse = "false";
				var shipA = {"id":Ships.indexOf(ship),"driver":ship.driver,"inUse":ship.inUse,"x":ship.x,"y":ship.y,"z":ship.z,"rx":ship.rx,"ry":ship.ry,"rz":ship.rz};
				socket.broadcast.emit('ShipServerRefresh', shipA);
				return;
			}
		});
		
	});

	socket.on('AddCar',function(data){
		
		Cars.push({"driver":"none","inUse":"false","x":String(data.x),"y":String(data.y),"z":String(data.z),"rx":"0","ry":"0","rz":"0"});
		console.log(Cars[1] + "--");
		Cars.forEach(function(car){
			if(car.driver == thisClientId)
				return;
			console.log(car);
			var carA = {"id":Cars.indexOf(car),"driver":car.driver,"inUse":car.inUse,"x":car.x,"y":car.y,"z":car.z,"rx":car.rx,"ry":car.ry,"rz":car.rz};
			socket.emit('CarServerRefresh',carA);
		});
	});
	socket.on('AddShip',function(data){
		Ships.push({"driver":"none","inUse":"false","x":String(data.x),"y":String(data.y),"z":String(data.z),"rx":"0","ry":"0","rz":"0"});
		console.log(Ships[Ships.length-1] + "--");
		Ships.forEach(function(ship){
			if(ship.driver == thisClientId)
				return;
			console.log(ship);
			var shipA = {"id":Ships.indexOf(ship),"driver":ship.driver,"inUse":ship.inUse,"x":ship.x,"y":ship.y,"z":ship.z,"rx":ship.rx,"ry":ship.ry,"rz":ship.rz};
			socket.emit('ShipServerRefresh',shipA);
		});
	});
})