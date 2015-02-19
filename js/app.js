// Class for drawable objects
var Drawable = function (sprite, x, y) {
    this.sprite = sprite;
    this.x = x === undefined ? 0 : x;
    this.y = y === undefined ? 0 : y;
};

// Place the drawable at a position
Drawable.prototype.setPosition = function(x, y) {
    this.x += x;
    this.y += y;
};

// Move the drawable
Drawable.prototype.move = function(xOffset, yOffset) {
    this.x += xOffset;
    this.y += yOffset;
};

// Draw the drawable
Drawable.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// Enemies our player must avoid : inherite Drawable
var Enemy = function() {
    Drawable.call(this, 'images/enemy-bug.png');
    // Speed of the enemy (in pixels per second)
    this.speed = 0;
    this.start();
};

// Inherit Drawable
Enemy.prototype = Object.create(Drawable.prototype);

// Randomly place the enemy in one of the 3 possibles starting positions
// with a random speed
Enemy.prototype.start = function() {
    this.setPosition(-101, 83*(Math.random()%3+1)-30);
    this.speed = Math.random() % 300 + 200;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.move(this.speed * dt, 0);
};



// The player : inherits Drawable
var Player = function() {
    // Call parent constructor and place him at start
    Drawable.call(this, 'images/char-boy.png');
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



// Check collision
function checkCollisions() {

}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
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
