var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// for now just increment player counter for ID
var playerId= 0;

// cursor locations/angles
var allLocations={};

// keep track of bullet information
var allBullets={};
var numBullets=0;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    socket.emit('init', socket.id);

    // initialize new player cursor
    var location={
        x:0, y:0, angle:0
    };
    allLocations[socket.id]=location;

    // give player id
    var myId=playerId;
    playerId++;

    // nice to know
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete allLocations[socket.id];
    });

    // update player location
    socket.on('coords', function(x, y, angle) {
        location.x = x;
        location.y = y;
    });

    socket.on('spin', function(angle) {
        location.angle = angle;
    });

    // user sends a fire request
    socket.on('fire', function(x, y, angle){
        var bullet={
            x:x, y:y
        };
        allBullets[numBullets]=bullet;
        numBullets++;
    });
});

function update(){
    for (var bull in allBullets){
        allBullets[bull].y-=4;
        if((allBullets[bull].y < 0 || allBullets[bull].y>1500) ||
            (allBullets[bull].x<0 || allBullets[bull].x>1500)){
            delete allBullets[bull];
        }

    }
    io.emit('update', allLocations, allBullets);
}

// send update to all clients every 16ms
setInterval(update, 16);

http.listen(3000, function(){
    console.log('listening on *:3000');
});