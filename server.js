var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var playerId= 0;
var allLocations={};
var allBullets={};
var numBullets=0;

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendfile('index.html');
});


io.on('connection', function(socket){
	socket.emit('init', socket.id);
	var location={
		x:0, y:0
	};
	allLocations[socket.id]=location;
	var myId=playerId;
	playerId++;
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    delete allLocations[socket.id];
  });
  socket.on('coords', function(x, y){
  	console.log(x+ ' '+ y);
  	location.x=x;
  	location.y=y;
  });
  socket.on('fire', function(x, y, angle){
  	var bullet={
  		x:x, y:y
  	};
  	allBullets[numBullets]=bullet;
  	numBullets++;
  })
});

function update(){
	for (var bull in allBullets){
		// allBullets[bull].x
		allBullets[bull].y-=4;
		if((allBullets[bull].y < 0 || allBullets[bull].y>1500) ||
			(allBullets[bull].x<0 || allBullets[bull].x>1500)){
			delete allBullets[bull];
		}

	}
	io.emit('update', allLocations, allBullets);
}

setInterval(update, 16);

http.listen(3000, function(){
  console.log('listening on *:3000');
});