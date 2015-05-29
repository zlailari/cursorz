var socket = io();

var canvas, ctx;

// frequency of update call
var fps = 25;

// create client cursor object
var myCursor = new Cursor();

// convert from angle to radians
var RADIANS = Math.PI/180;

// Arrays for bullets/Cursors
var allBullets = {};
var allCursors = {};

var nextBullets = {};
var nextCursors = {};

var lastTime;


function init() {
    // make canvas full screen
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    // hide your real cursor
    ctx.canvas.style.cursor = "none";

    socket.emit('new cursor', myCursor);

    lastTime = Date.now();

    function animate() {
        requestAnimationFrame(animate);
        render();
    }
    animate();

    setInterval(function() { gameLoop() }, fps);
}

function gameLoop() {
    var currentTime = Date.now();

    var deltaTime = (currentTime - lastTime)/1000 

    update(deltaTime);

    lastTime = currentTime;
}

function update(delta) {
    for (var bullet in allBullets){
        checkCollisions(allBullets[bullet], bullet);
    }

    // change angle if keydown
    //  0 for no movement
    //  1 for spin clockwise
    //  2 for spin counter clockwise
    if (myCursor.spinning === 1) {
        myCursor.angle += (300*delta);
    }
    else if (myCursor.spinning === 2) {
        myCursor.angle -= (300*delta);
    }

    // enforce a firing rate
    if(myCursor.reloadTime <= 0) {
        if (myCursor.shoot) {
            var newBullet = new Bullet(myCursor.x, myCursor.y, myCursor.angle);
            socket.emit('new bullet', newBullet);
            myCursor.shoot = false;
        }
    } 
    else {
        myCursor.reloadTime--;
    }

    // send update about your cursor
    socket.emit('my cursor update', myCursor);
}

function checkCollisions(bullet, bulletID) {
    // check collisions
    var p = ctx.getImageData(bullet.x, bullet.y,1,1).data;
    if ((p[0]+p[1]+p[2]) >= 255) {

        socket.emit('hit', bullet.x, bullet.y, bulletID);
        renderExplosion(bullet.x, bullet.y);
    }
}

function render(){
    // draw black background
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

    // draw objects
    renderCursors();
    renderBullets();
}

function renderCursors() {
    for(var cursor in allCursors){
        drawCursor(ctx, allCursors[cursor], nextCursors[cursor]);
        allCursors[cursor] = nextCursors[cursors];
    }
}

function renderBullets() {
    for (var bullet in allBullets){
        drawBullet(ctx, allBullets[bullet]);
        allBullets[bullet] = nextBullets[bullet];
    }
}

function renderExplosion (x, y) {
    ctx.beginPath();
    ctx.arc(x,y,22,0,2*Math.PI);
    ctx.strokeStyle = '#FF0000';
    ctx.stroke();
}

$(document).bind('keydown', function(e) {
    var code = e.keyCode || e.which;
    switch(code) {
        // left or a
        case 37:
        case 65:
            // spin counter clockwise
            myCursor.spinning = 2;
            break;
        // up or w
        case 38:
        case 87:
            // do nothing for now
            break;
        // right or d
        case 39:
        case 68:
            // spin clockwise
            myCursor.spinning = 1;
            break;
        // down or s
        case 40:
        case 83:
            //do nothing for now
            break;
    }
});

$(document).bind('keyup', function(e) {
    var code = e.keyCode || e.which;
    switch(code) {
        // left or a
        case 37:
        case 65:
            myCursor.spinning = 0;
            break;
        // up or w
        case 38:
        case 87:
            // do nothing for now
            break;
        // right or d
        case 39:
        case 68:
            myCursor.spinning = 0;
            break;
        // down or s
        case 40:
        case 83:
            //do nothing for now
            break;
    }
});

document.addEventListener('mousemove', function(e) {
    myCursor.x = e.clientX || e.pageX; 
    myCursor.y = e.clientY || e.pageY;
}, false);


$(document).click(function(event){
    myCursor.shoot = true;
});

socket.on('server update', function(newCursors, newBullets) {
    nextCursors = newCursors;
    nextBullets = newBullets;
});

init();