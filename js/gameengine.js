/* GameEngine
 * This represents a game engine.
 *
 * create an instance :
 *     var engine = new GameEngine(width, height);
 *
 * choose the element for capture input :
 *     var gameInputs = GameInputs(document);
 *
 * send inputs to an handler :
 *     gameInputs(actionHandler);
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
 */
var GameEngine = function(width, height) {
    // Create the canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    var context = this.canvas.getContext('2d');

    // A list of added layers
    var layers = [];
    this.layersDict = {};

    // A list of required images' URLs
    var requiredImages = [];

    // key = URL, value = Image()
    var images = {};


    /* Add a layer to the game engine */
    this.addLayer = function(layer) {
        layers.push(layer);
        this.layersDict[layer.name] = layer;

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
            if(layer.running && layer.update) {layer.update(now);}
            if(layer.visible && layer.draw) {layer.draw(context);}
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



/* Layer
 * A game is made of differents layers, for example a background, entities, a menu etc ...
 * layer.requiredImages : a list of images' urls needed by the layer
 * layer.onLoad(images) : this will be called when all required images are loaded
 *                        images = key : url, value : HTMLImageElement
 * layer.update(now) : this will be called every loop, usefull for update the layer
 *                     now = a DOMHighResTimeStampthe, the time since start of navigation
 * layer.draw(context) : this will be called every loop, usefull for render the layer
 *                         context = a CanvasRenderingContext2D, the rendering target
 */
var Layer = function(name) {
    this.name = name;

    // A list of images' urls needed by the layer
    this.requiredImages = [];

    // A list of drawables to draw on each call to this.draw(context)
    this.drawables = [];

    // true if layer.update() should be called on each loop
    // this.running = undefined;

    // true if layer.draw() should be called on each loop
    // this.visible = undefined;
};


/* Virtual, this will be called when all required images are loaded
 * images = key : url, value : HTMLImageElement
 */
// Layer.prototype.onLoad = function(images) {};


/* Virtual, this will be called every loop, usefull for update the layer
 * now = a DOMHighResTimeStampthe, the time since start of navigation
 */
// Layer.prototype.update = function(now) {};


/* true if layer.update should be called on each loop */


/* this will be called every loop
 * context = a CanvasRenderingContext2D, the rendering target
 */
Layer.prototype.draw = function(context) {
    this.drawables.forEach(function(drawable) {
        drawable.draw(context);
    });
};


/* Drawable
 * Represente something that can be draw on a render target
 */
var Drawable = function(x, y) {
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


/* Listen inputs, filter, transform to an action name, then send them
 * to the last one who have made the request via inputs(requester)
 * requester : function(action -> string)
 */
var GameInputs = function(eventSource) {
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
        }
    });

    return function(newListener) {
        listener = newListener;
    };
};
