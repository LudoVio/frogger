/* GameEngine
 * This represents a game engine.
 *
 * create an instance :
 *     var engine = new GameEngine(width, height);
 *
 * add layers :
 *     engine.addLayer(myLayer_1);
 *     engine.addLayer(myLayer_2);
 *
 * add the canvas into the document :
 *     document.body.appendChild(engine.canvas);
 *
 * start the engine :
 *     engine.start();
 *
 * A layer is an object with optionals properties and methods :
 * layer.requiredImages : a list of images' urls needed by the layer
 * layer.onLoad(images) : this will be called when all required images are loaded
 *                        images = key : url, value : HTMLImageElement
 * layer.update(now) : this will be called every loop, usefull for update the layer
 *                     now = a DOMHighResTimeStampthe, the time since start of navigation
 * layer.draw(context) : this will be called every loop, usefull for render the layer
 *                         context = a CanvasRenderingContext2D, the rendering target
 */
var GameEngine = function(width, height) {
    // Create the canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    var context = this.canvas.getContext('2d');

    // A list of added layers
    var layers = [];

    // A list of required images' URLs
    var requiredImages = [];

    // key = URL, value = Image()
    var images = {};


    /* Add a layer to the game engine */
    this.addLayer = function(layer) {
        layers.push(layer);

        // for each url in layers.requiredImages :
        //     add it to requiredImages if not already there
        layer.requiredImages.forEach(function(url) {
            if(requiredImages.indexOf(url) === -1) {
                requiredImages.push(url);
            }
        });
    };


    /* remove element from array */
    var remove = function(element, array) {
        var index = array.indexOf(element);
        array.splice(index, 1);
    };


    /* called when one resource is loaded
     * if requiredImages is empty : call loadedAll()
     */
    var loadedOne = function(url) {
        remove(url, requiredImages);
        if(requiredImages.length === 0) {
            loadedAll();
        }
    };


    /* called when all resources are loaded
     * for each layer : call layer.onLoad(images)
     * call mainLoop()
     */
    var loadedAll = function() {
        layers.forEach(function(layer) {
            layer.onLoad(images);
        });
        requestAnimationFrame(mainLoop);
    };


    /* Start the game engine */
    this.start = function() {
        // create and load each required images
        requiredImages.slice(0).forEach(function(url) {
            images[url] = new Image();
            images[url].onload = loadedOne.bind(null, url);
            images[url].src = url;
        });
    };


    /* main loop */
    var mainLoop = function (now) {
        // call again this function on browser repaint
        requestAnimationFrame(mainLoop);

        // update and render each layer
        layers.forEach(function(layer) {
            if(layer.update) {layer.update(now);}
            if(layer.draw) {layer.draw(context);}
        });
    };


    /* for debuging purpose */
    this.debug = function() {
        return {
            layers: layers,
            requiredImages: requiredImages,
            images: images
        };
    };
};



/* Drawable
 * Represente something that can be draw on a render target
 */
var Drawable = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};


/* Place the drawable at a position */
Drawable.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
};


/* Move the drawable */
Drawable.prototype.move = function(xOffset, yOffset) {
    this.x += xOffset;
    this.y += yOffset;
};



/* Sprite : extend Drawable
 * A drawable for an image
 */
var Sprite = function(image, x, y) {
    Drawable.call(this, x, y);
    this.image = image;
};


/* extend Drawable */
Sprite.prototype = Object.create(Drawable.prototype);


/* draw the sprite on a context */
Sprite.prototype.draw = function(context) {
    context.drawImage(this.image, this.x, this.y);
};
