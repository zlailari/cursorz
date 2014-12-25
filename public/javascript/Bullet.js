// bullet object
var Bullet= function (xPos, yPos, angle) {
    this.x = xPos;
    this.y = yPos;
    this.angle = angle;

    // mark bullet to be deleted
    this.kill = false;
};

drawBullet = function(ctx, bullet) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(bullet.x, bullet.y, 2, 2);
}