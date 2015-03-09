/* frogger.js
 * This file define the game frogger, it require gameengine.js
 */


/* layer for the background */
var backgroundLayer = new Layer('background');

backgroundLayer.requiredImages = [
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png'
];

backgroundLayer.onLoad = function(images) {
    this.visible = true;
    var tileSet = {
        0: images['images/stone-block.png'],
        1: images['images/water-block.png'],
        2: images['images/grass-block.png']
    };
    var tiles = [
        1, 1, 1, 1, 1,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        2, 2, 2, 2, 2,
        2, 2, 2, 2, 2
    ];
    var colNb = 5;
    var x, y;
    // fill this.sprites with Sprite and set the image and position
    tiles.forEach(function(tile, idx) {
        x = (idx % colNb) * 101;
        y = Math.floor(idx / colNb) * 83;
        this.drawables.push(new Sprite(tileSet[tile], x, y));
    }.bind(this));
};


backgroundLayer.draw = function(context) {
    context.fillStyle = 'white';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    Layer.prototype.draw.call(this, context);
};



/* Returns a random integer between min (included) and max (excluded) */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


/* Enemies our player must avoid : inherite Sprite */
var Enemy = function(image) {
    this.collideZone = { 'xOffset': 1,
                        'yOffset': 100,
                        'width': 99,
                        'height': 42};
    Sprite.call(this, image);
    // Speed of the enemy (in pixels per second)
    this.speed = 0;
    this.start();
};

/* extend Sprite */
Enemy.prototype = Object.create(Sprite.prototype);

/* Randomly place the enemy in one of the 3 possibles starting positions
 * with a random speed
 */
Enemy.prototype.start = function() {
    this.setPosition(-101, 83*getRandomInt(1, 4)-30);
    this.speed = getRandomInt(120, 380);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(delta) {
    this.move(this.speed * delta, 0);
    if(this.x > 101*5) {this.start();}
};


/* The player : inherits Drawable */
var Player = function(image, x, y) {
    // Call parent constructor and place him at start
    this.collideZone = { 'xOffset': 33,
                        'yOffset': 120,
                        'width': 35,
                        'height': 20};
    Sprite.call(this, image, x, y);

    this.start();
};

/* extend Sprite */
Player.prototype = Object.create(Sprite.prototype);

/* Place the player at starting point */
Player.prototype.start = function() {
    this.setPosition(101*2, 83*5-30);
};

/* React to user inputs */
Player.prototype.actionHandler = function(action) {
    switch(action) {
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


/* layer for the player */
var playerLayer = new Layer('player');

playerLayer.requiredImages = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

playerLayer.onLoad = function(images) {
    this.visible = true;
    this.drawables.push(new Player(images['images/char-boy.png'], 101*2, 83*5-30));
};


/* Return the absolute collide rectangle */
function getAbsCollideZone(obj) {
    return { 'x': obj.x + obj.collideZone.xOffset,
             'y': obj.y + obj.collideZone.yOffset,
             'width': obj.collideZone.width,
             'height': obj.collideZone.height};
}


/* Check if 2 drawable collide */
function areCollided(objA, objB) {
    objA = getAbsCollideZone(objA);
    objB = getAbsCollideZone(objB);
    if(objA.x > objB.x + objB.width) {return false;}
    if(objA.x + objA.width < objB.x) {return false;}
    if(objA.y > objB.y + objB.height) {return false;}
    if(objA.y + objA.height < objB.y) {return false;}
    return true;
}


/* layer for the enemies */
var enemiesLayer = new Layer('enemies');

enemiesLayer.requiredImages = [
    'images/enemy-bug.png'
];

enemiesLayer.onLoad = function(images) {
    this.visible = true;
    for(var i = 0; i < 3; ++i) {
        this.drawables.push(new Enemy(images['images/enemy-bug.png']));
    }
};

enemiesLayer.update = function(now) {
    if(!this.lastTime) {
        this.lastTime = now;
    }
    var delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.drawables.forEach(function(drawable) {
        drawable.update(delta);
        if(areCollided(drawable, playerLayer.drawables[0])) {
            frogger.mainMenu(false);
        }
    }.bind(this));
};


/* layer for the menu */
var menuLayer =  new Layer('menu');

menuLayer.requiredImages = [
    'images/Selector.png',
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

menuLayer.onLoad = function(images) {
    this.visible = true;
    this.drawables.push(new Sprite(images['images/Selector.png'], 0, 200));
    this.selector = this.drawables[0];
    this.requiredImages.forEach(function(url, idx) {
        if (idx >= 1) this.drawables.push(new Sprite(images[url], (idx - 1) * 101, 200));
    }.bind(this));
};

menuLayer.drawText = function(text, color, context) {
    context.fillStyle = color;
    context.font = '48px serif';
    context.textAlign = 'center';
    context.fillText(text, context.canvas.width/2, 50);
    context.strokeStyle = 'white';
    context.strokeText(text, context.canvas.width/2, 50);
};

menuLayer.draw = function(context) {
    context.fillStyle = 'rgba(0, 0, 0, 0.85)';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    if(this.result === true) {this.drawText('You Win !', 'green', context);}
    if(this.result === false) {this.drawText('You Lose !', 'red', context);}
    Layer.prototype.draw.call(this, context);
};


menuLayer.actionHandler = function(action) {
    switch(action) {
        case 'left':
            if(this.selector.x > 0) {
                this.selector.move(-101, 0);
            }
            break;
        case 'right':
            if(this.selector.x < 101*4) {
                this.selector.move(101, 0);
            }
            break;
        case 'select':
            var selection = Math.floor(this.selector.x / 101) + 1;
            var image = this.drawables[selection].image;
            this.selectCallback(this.drawables[selection].image);
            break;
    }
};


/* The game of frogger
 * this is a very simple pseudo state machine
 */
var Frogger = function() {
    // configure and start the game
    this.engine = new GameEngine(505, 606);
    var element = document.getElementById("window")
    element.appendChild(this.engine.canvas);
    this.gameInputs = GameInputs(document);
    this.engine.addLayer(backgroundLayer);
    this.engine.addLayer(enemiesLayer);
    this.engine.addLayer(playerLayer);
    this.engine.addLayer(menuLayer);
    menuLayer.selectCallback = this.game.bind(this);
    this.engine.start();
    this.mainMenu();
};


/* pause all layer and display the main menu */
Frogger.prototype.mainMenu = function(result) {
    this.gameInputs(menuLayer.actionHandler.bind(menuLayer));
    enemiesLayer.running = false;
    menuLayer.result = result;
    menuLayer.visible = true;
};


/* hide menu and play */
Frogger.prototype.game = function(selection) {
    menuLayer.visible = false;
    playerLayer.drawables[0].image = selection;
    this.gameInputs(playerLayer.drawables[0].actionHandler.bind(playerLayer.drawables[0]));
    playerLayer.drawables[0].start();
    enemiesLayer.running = true;
};


// Create and launch frogger
var frogger = new Frogger();
