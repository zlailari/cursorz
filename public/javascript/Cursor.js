// cursor setup
var cursorPic = new Image();
cursorPic.src = ('/img/cursorimg.png');

// convert from angle to radians
var RADIANS = Math.PI/180;

var Cursor = function () {
	this.x = 200;
	this.y = 200;

	this.height = 20;
	this.width = 13;

	this.angle = 0;

	// 0 for no movement
	// 1 for spin clockwise
	// 2 for spin counter clockwise
	this.spinning = 0;

	// player requests to shoot
	this.shoot = false;

	// limits firing rate
	this.reloadTime = 5;

	this.health = 3;
}

drawCursor = function(ctx, currentCursor, nextCursor) {
	if(nextCursor.x != currentCursor.x) {
		nextCursor.x = (nextCursor.x+currentCursor.x)/2;
	}
	if(nextCursor.y != currentCursor.y) {
		nextCursor.y = (nextCursor.y+currentCursor.y)/2;
	}
	// stores current coordinate system
    ctx.save();

    // shift coordinate system, rotate, draw
    ctx.translate(nextCursor.x, nextCursor.y);
    ctx.rotate(nextCursor.angle * RADIANS);
    ctx.drawImage(cursorPic, 0, 0, nextCursor.width, nextCursor.height);

    // return to old coorginate system
    ctx.restore();
}
