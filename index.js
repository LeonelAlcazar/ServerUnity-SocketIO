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

var Items =[];

function broadcastIO(msg,data){
	io.sockets.emit(msg,data);
	return;
}

io.on('connection', function(socket){
	var thisClientId = shortid.generate();
	var nick = "";
	var inventory = "";

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
	Items.forEach(function(item){
		
		socket.emit('CreateItem',item);
	});

	socket.on('disconnect',function(){
		var mysql = require('mysql');

		var client = mysql.createConnection({
			host: 'db4free.net',
			user: 'mm0_unity',
			password: 'mm0_unity',
			database: 'mm0_unity'
		});
		client.query("UPDATE users SET inventory='"+inventory+"' WHERE nickname='"+nick+"'").on('error',function(err){
			return console.log("[mysql error]",err);
		});
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
		nick = data.nick;
		socket.broadcast.emit('PlayerPosRefresh',data);
	});

	socket.on('RefreshInventory',function(data){
		inventory = data.inventory;
	})

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

		var mysql = require('mysql');

		var client = mysql.createConnection({
			host: 'db4free.net',
			user: 'mm0_unity',
			password: 'mm0_unity',
			database: 'mm0_unity'
		});
		console.log("----");
		client.query("SElECT * FROM users WHERE nickname LIKE '"+nick+"'",function(err,result){
			if(result[0].money >= data.price){
				var money = result[0].money - data.price;
				client.query("UPDATE users SET money='"+money+"' WHERE nickname='"+nick+"'").on('error',function(err){
					return console.log("[mysql error]",err);
				});
				client.end();
				Cars.push({"driver":"none","inUse":"false","x":String(data.x),"y":String(data.y),"z":String(data.z),"rx":"0","ry":"0","rz":"0"});

				Cars.forEach(function(car){
					if(car.driver == thisClientId)
						return;
					console.log(car);
					var carA = {"id":Cars.indexOf(car),"driver":car.driver,"inUse":car.inUse,"x":car.x,"y":car.y,"z":car.z,"rx":car.rx,"ry":car.ry,"rz":car.rz};
					broadcastIO('CarServerRefresh',carA);

				});

				socket.emit('MoneyRefresh',{"money":money});

			}
		}).on('error',function(err){
			console.log("[mysql error]",err);
		});
	});
	socket.on('AddShip',function(data){

		var mysql = require('mysql');

		var client = mysql.createConnection({
			host: 'db4free.net',
			user: 'mm0_unity',
			password: 'mm0_unity',
			database: 'mm0_unity'
		});

		client.query("SElECT * FROM users WHERE nickname LIKE '"+nick+"'",function(err,result){
			if(result[0].money >= data.price){
				var money = result[0].money - data.price;
				console.log(money);
				client.query("UPDATE users SET money='"+money+"' WHERE nickname LIKE '"+nick+"'").on('error',function(err){
					return console.log("[mysql error]",err);
				});
				client.end();

				Ships.push({"driver":"none","inUse":"false","x":String(data.x),"y":String(data.y),"z":String(data.z),"rx":"0","ry":"0","rz":"0"});
				console.log(Ships[Ships.length-1] + "--");
				Ships.forEach(function(ship){
					if(ship.driver == thisClientId)
						return;
					console.log(ship);
					var shipA = {"id":Ships.indexOf(ship),"driver":ship.driver,"inUse":ship.inUse,"x":ship.x,"y":ship.y,"z":ship.z,"rx":ship.rx,"ry":ship.ry,"rz":ship.rz};
					broadcastIO('ShipServerRefresh',shipA);
				});

				socket.emit('MoneyRefresh',{"money":money});

			}
		}).on('error',function(err){
			console.log("[mysql error]",err);
		});
	});
	socket.on('AddItem',function(data){
		console.log('Item');
		Items.push(data);
		socket.broadcast.emit('CreateItem',data);
	});
	socket.on('DestroyItem',function(data){
		Items.forEach(function(item){
			if(Items.indexOf(item) == data.id){
				Items.splice(Items.indexOf(item),1);
				socket.broadcast.emit("DestroyItem",data);
			}
		});
	});
})