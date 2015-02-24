/* frogger.js
 * This file define the game frogger, it require gameengine.js
 */


/* layer for the background */
var backgroundLayer = {
    name: 'background',
    requiredImages: [
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png'
    ],
    sprites: [],
    onLoad: function(images) {
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
        var rowNb = 6;
        var tilesNb = colNb * rowNb;
        var x, y;
        // fill this.sprites with Sprite and set the image and position
        tiles.forEach(function(tile, idx) {
            x = (idx % colNb) * 101;
            y = Math.floor(idx / colNb) * 83;
            this.sprites.push(new Sprite(tileSet[tile], x, y));
        }.bind(this));
    },
    draw: function(context) {
        this.sprites.forEach(function(sprite) {
            sprite.draw(context);
        });
    }
};


/* layer for the enemies */
var enemiesLayer = {
    name: 'enemies',
    requiredImages: [
        'images/enemy-bug.png'
    ],
    onLoad: function(images) {}
};


/* layer for the player */
var playerLayer = {
    name: 'player',
    requiredImages: [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ],
    onLoad: function(images) {}
};


/* layer for the menu */
var menuLayer = {
    name: 'menu',
    requiredImages: [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Selector.png'
    ],
    onLoad: function(images) {}
};


/* configure and start the game */
var engine = new GameEngine(505, 606);
document.body.appendChild(engine.canvas);
engine.addLayer(backgroundLayer);
engine.addLayer(enemiesLayer);
engine.addLayer(playerLayer);
engine.addLayer(menuLayer);
engine.start();
