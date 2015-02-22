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

// Get the position
Drawable.prototype.getPosition = function() {
    return [this.x, this.y];
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

// Draw the drawable
Drawable.prototype.draw = function(context) {
    context.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// Listen inputs, filter, transform to an action name, then send them
// to the last one who have made the request via inputs(requester)
// requester : function(action -> string)
var inputs = function(eventSource) {
    var listener = function(){};

    var actions = {32: 'select',
                   37: 'left',
                   38: 'up',
                   39: 'right',
                   40: 'down'
                  };

    eventSource.addEventListener('keyup', function(event) {
        if(event.keyCode in actions) {
            listener(actions[event.keyCode]);
        }});

    return function(newListener) {
        listener = newListener;
    };
};



/* Display a menu :
 * - display if a player won or lost his last game
 * - display a choice of available characters and let the player chose one
 * - return the choice
 */
function menu(screen, inputs, returnCallback) {
    function drawText(text, color) {
        context.fillStyle = color;
        context.font = '48px serif';
        context.textAlign = 'center';
        context.fillText(text, context.canvas.width/2, 50);
        context.strokeText(text, context.canvas.width/2, 50);
    }

    var charsURL = ['images/char-boy.png',
                 'images/char-cat-girl.png',
                 'images/char-horn-girl.png',
                 'images/char-pink-girl.png',
                 'images/char-princess-girl.png'
                ];

    var chars = charsURL.map(function(url, idx) {
        var drawable = new Drawable(url);
        drawable.setPosition(idx*101, 200);
        return drawable;
    });

    var selector = new Drawable('images/Selector.png');
    var choice = 2;

    function listener(action) {
        switch(action) {
            case 'left':
                if(choice > 0) {
                    --choice;
                }
                break;
            case 'right':
                if(choice < 4) {
                    ++choice;
                }
                break;
            case 'select':
                inputs(function(){});
                returnCallback(choice);
                break;
        }
    }

    function listen() {
        inputs(listener);
    }

    function draw(context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        if(result === true) {drawText(context, 'You Win !', 'green');}
        if(result === false) {drawText(context, 'You Lose !', 'red');}
        selector.setPosition.apply(selector, chars[choice].getPosition());
        selector.draw(context);
        chars.forEach(function(drawable) {
            drawable.draw(context);
        });
    }

    var result;
    function setResult(newResult) {
        result = newResult;
    }

    return {listen: listen,
            draw: draw,
            setResult: setResult};
}



// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}



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
        32: 'select',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});



var start = function(context, eventSource) {
    inputs = inputs(eventSource);
    menu = menu(context, inputs, next);
    game = game();

    function next(charPlayer) {

    };

    menu.listen();
    menu.setResult(false);
    +function draw() {
        mymenu.draw();
        menuID = window.requestAnimationFrame(draw);
    }();
};

var init = function(context, eventSource) {
    inputs = inputs(eventSource);
    menu = menu.bind(null, context, inputs);
    menuState = menuState.bind(menu);
};

function froggerMain() {

};
