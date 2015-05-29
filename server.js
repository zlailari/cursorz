var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var updateRate = 30; // in ms
var lastTime = Date.now()sadfasdf more breaking;

// cursor locations/angles
var allCursors={}sdfadfsd breaking this;

// keep track of bullet information
var allBullets={};
var numBullets=0;

var RADIANS = Math.PI/180;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    // nice to know
    console.log('a user connected');

    // new player sends their cursor object to be shared
    //   with the rest of the players
    socket.on('new cursor', function(newCursor) {
        // store new cursor object in server array
        allCursors[socket.id] = newCursor;
    });

    // update player location
    socket.on('my cursor update', function(cursor) {
        if (allCursors[socket.id] != undefined) {
            allCursors[socket.id].x = cursor.x;
            allCursors[socket.id].y = cursor.y;
            allCursors[socket.id].angle = cursor.angle;
        }
    });

    // user sends a fire request
    socket.on('new bullet', function(bullet){
        allBullets[numBullets] = bullet;
        numBullets++;
    });

    socket.on('hit', function(x, y, bulletID) {
        damageNearby(x,y);
        // allBullets[bulletID].kill = true;
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete allCursors[socket.id];
    });
});

function gameLoop(){
    var currentTime = Date.now();

    // caculate time since last update
    var deltaTime = (currentTime - lastTime)/1000;

    update(deltaTime);
}

function update(delta) {
    for (var bullet in allBullets){
        if(allBullets[bullet].kill) {
            delete allBullets[bullet];
        }
        else{
            // checkCollisions(allBullets[bullet]);
            updateBullets(delta, allBullets[bullet]);
        }
    }
    io.emit('server update', allCursors, allBullets);
}

function updateBullets(delta, bullet) {
    bullet.x -= 100*(Math.cos(bullet.angle*RADIANS+(3*Math.PI/8)))*delta;
    bullet.y -= 100*(Math.sin(bullet.angle*RADIANS+(3*Math.PI/8)))*delta;
    if((bullet.y < 0 || bullet.y>1500) ||
       (bullet.x < 0 || bullet.x>1500)){
        bullet.kill = true;
    }
}

// function checkCollisions(bullet) {
//     // check collisions
//     var p = ctx.getImageData(bullet.x, bullet.y,2,2).data;

//     if ((p[0]+p[1]+p[2]) !== 0 || (p[12]+p[13]+p[14]) !== 0) {
//         io.emit('hit', bullet.x, bullet.y);
//         damageNearby(bullet.x, bullet.y);
//         bullet.kill = true;
//     }
// }

function damageNearby(x, y) {
    // affects any tip of pointer within 22 pixels
    var explosionSize = distance(0, 0, 22, 22);
    for (var cursor in allCursors) {
        var distanceFromExplosion = distance(allCursors[cursor].x, allCursors[cursor].y, x, y);
        if (distanceFromExplosion < explosionSize) {
            allCursors[cursor].health--;
            console.log("health = "+allCursors[cursor].health)
        }
    }
}

function distance(x1, y1, x2, y2) {
    Math.sqrt( Math.pow((x2-x1),2)+Math.pow((y2-y1),2) );
}

// send update to all clients every {updateRate} ms
setInterval(update, updateRate);

http.listen(3000, function(){
    console.log('listening on *:3000');
});
