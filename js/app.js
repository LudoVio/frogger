// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}



// Class for drawable objects
var Drawable = function (sprite, collideZone) {
    this.sprite = sprite;
    this.x = 0;
    this.y = 0;
    // collideZone : {xOffset, yOffset, width, height}
    this.collide = collideZone === undefined ? false : true;
    this.collideZone = collideZone;
};

// Place the drawable at a position
Drawable.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
};

// Move the drawable
Drawable.prototype.move = function(xOffset, yOffset) {
    this.x += xOffset;
    this.y += yOffset;
};

// Return the absolute collide rectangle
Drawable.prototype.getAbsCollideZone = function() {
    return { 'x': this.x + this.collideZone.xOffset,
             'y': this.y + this.collideZone.yOffset,
             'width': this.collideZone.width,
             'height': this.collideZone.height};
};

// Draw the drawable
Drawable.prototype.render = function() {
    /* global ctx, Resources */
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// Enemies our player must avoid : inherite Drawable
var Enemy = function() {
    var collideZone = { 'xOffset': 1,
                        'yOffset': 100,
                        'width': 99,
                        'height': 42};
    Drawable.call(this, 'images/enemy-bug.png', collideZone);
    // Speed of the enemy (in pixels per second)
    this.speed = 0;
    this.start();
};

// Inherit Drawable
Enemy.prototype = Object.create(Drawable.prototype);

// Randomly place the enemy in one of the 3 possibles starting positions
// with a random speed
Enemy.prototype.start = function() {
    this.setPosition(-101, 83*getRandomInt(1, 4)-30);
    this.speed = getRandomInt(120, 380);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.move(this.speed * dt, 0);
    if(this.x > 101*5) {this.start();}
};



// The player : inherits Drawable
var Player = function() {
    // Call parent constructor and place him at start
    var collideZone = { 'xOffset': 33,
                        'yOffset': 120,
                        'width': 35,
                        'height': 20};
    Drawable.call(this, 'images/char-boy.png', collideZone);

    this.start();
};

// Inherit Drawable
Player.prototype = Object.create(Drawable.prototype);

// Place the player at starting point
Player.prototype.start = function() {
    this.setPosition(101*2, 83*5-30);
};

// React to user inputs
Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case 'up':
            if(this.y > 83-30) {this.move(0, -83);}
            break;
        case 'right':
            if(this.x < 101*4) {this.move(101, 0);}
            break;
        case 'down':
            if(this.y < 83*5-30) {this.move(0, 83);}
            break;
        case 'left':
            if(this.x > 0) {this.move(-101, 0);}
            break;
    }
};



// Check if 2 drawable collide
function areCollided(objA, objB) {
    objA = objA.getAbsCollideZone();
    objB = objB.getAbsCollideZone();
    if(objA.x > objB.x + objB.width) {return false;}
    if(objA.x + objA.width < objB.x) {return false;}
    if(objA.y > objB.y + objB.height) {return false;}
    if(objA.y + objA.height < objB.y) {return false;}
    return true;
}

// Check collision
/* exported checkCollisions */
/* global init */
function checkCollisions() {
    allEnemies.forEach(function(enemy) {
        if(areCollided(enemy, player)) {
            init();
        }
    });
}

// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for(var i=0; i < 3 ; ++i) {
    allEnemies.push(new Enemy());
}

var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
