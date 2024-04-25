function Table(dataImage, displayObject) {
    var self = this;
    self.data = getImageData(dataImage);
    self.display = displayObject;
    self.width = dataImage.width;
    self.height = dataImage.height;
    self.ball = null;
    self.sprites = [];
    self.x = 0;
    self.y = 0;

    self.addSprite = function(sprite) {
        sprite.table = self;
        self.sprites.push(sprite);
    }
    self.removeSprite = function(sprite) {
        var sprites = self.sprites;
        var len = sprites.length;
        for(var i = 0; i < len; i++) {
            sprites[i].splice(i, 1);
        }
    }

    /* Events */
    var events = {};
    self.addEventListener = function(type, callback) {
        if(!events[type]) {
            events[type] = [];
        }
        events[type].push(callback);
    }
    self.removeEventListener = function(type, callback) {
        if(events[type]) {
            var callbacks = events[type];
            var len = callbacks.length;
            
            for(var i = 0; i < len; i++) {
                callbacks.splice(i, 1);
            }
        }
    }
    self.dispatchEvent = function(type, e) {
        if(!e) e = {};
        e.type = type;
        var callbacks = events[type];
        if(callbacks) {
            var len = callbacks.length;
            for(var i = 0; i < len; i++) {
                callbacks[i](e);
            }
        }
    }
}

function Ball(dataImage, displayObject) {
    var self = this;
    self.display = displayObject;
    self.x = 0;
    self.y = 0;
    self.v = 0;
    self.vx = 0;
    self.vy = 0;
    self.ground = false;
    self.angle = 0;
    self.pixelHittest = function(sprite) {
        var spriteData = sprite.data.data;
        var spriteX, spriteY;
        var data = [];
        data[SENSOR_SOLID] = false;
        data[SENSOR_LISTENER] = false;
        data[SENSOR_SLOPE] = null;
        var slopes = {};
        var slope;

        spriteX = Math.floor(self.x - sprite.x);
        spriteY = Math.floor(self.y - sprite.y);
        // If the ball's pixel is within the second sprite
        if(spriteX >= 0 && spriteX < sprite.width && spriteY >= 0 && spriteY < sprite.height) {
            spriteIndex = 4 * (sprite.width * spriteY + spriteX);
            if(spriteData[spriteIndex+3] == 0xFF) {
                data[SENSOR_SOLID] = true;
                data[SENSOR_SLOPE] = spriteData[spriteIndex];
            } else if(spriteData[spriteIndex+3] > 0) {
                data[SENSOR_LISTENER]++;
            }
        }
        return data;
    }
    self.setSlope = function(slope) {
        var ball = self;
        if(!ball.ground || Math.abs(slope - ball.angle) >= 32) {
            var vx = ball.vx, vy = ball.vy;
            var surfaceAngle = slope * MATH_2PI * 0.00390625; 
            var ballAngle = Math.atan2(ball.vy, ball.vx);
            var ballSpeed = Math.sqrt(vx * vx + vy * vy);
            var newV = ballSpeed * Math.cos(ballAngle - surfaceAngle);
            ball.v = newV;
            ball.ground = true;
        }
        ball.angle = slope;
    }
}

function Sprite(dataImage, displayObject) {
    var self = this;
    self.data = getImageData(dataImage);
    self.display = displayObject;
    self.collision = false;
    self.x = 0;
    self.y = 0;
    self.width = dataImage.width;
    self.height = dataImage.height;
    self.energy = 1;

    /* Events */
    var events = {};
    self.addEventListener = function(type, callback) {
        if(!events[type]) {
            events[type] = [];
        }
        events[type].push(callback);
    }
    self.removeEventListener = function(type, callback) {
        if(events[type]) {
            var callbacks = events[type];
            var len = callbacks.length;
            
            for(var i = 0; i < len; i++) {
                callbacks.splice(i, 1);
            }
        }
    }
    self.dispatchEvent = function(type, e) {
        if(!e) e = {};
        e.type = type;
        var callbacks = events[type];
        if(callbacks) {
            var len = callbacks.length;
            for(var i = 0; i < len; i++) {
                callbacks[i](e);
            }
        }
    }
}

function AnimatedSprite(dataImage, displayObject, numFrames) {
    var self = this;
    var currentFrame = 0;
    var loop = false;
    self.dataFrames = getDataFrames(dataImage, numFrames);
    self.data = self.dataFrames[0];
    self.display = displayObject;
    self.collision = false;
    self.frames = numFrames;
    self.x = 0;
    self.y = 0;
    self.width = dataImage.width;
    self.height = dataImage.height/numFrames;
    self.energy = 1;

    /* Animations */
    self.loop = function() {
        loop = true;
    }
    self.cancelLoop = function() {
        loop = false;
    }
    self.isLooping = function() {
        return loop;
    }
    self.nextFrame = function() {
        currentFrame++;
        if(currentFrame >= self.frames) {
            if(loop) {
                currentFrame = 0;
                self.data = self.dataFrames[currentFrame];
            } else {
                currentFrame = self.frames - 1;
            }
        } else {
            self.data = self.dataFrames[currentFrame];
        }
    }
    self.previousFrame = function() {
        currentFrame--;
        if(currentFrame < 0) {
            if(loop) {
                currentFrame = self.frames - 1;
            } else {
                currentFrame = 0;
            }
        }
        self.data = self.dataFrames[currentFrame];
    }
    self.currentFrame = function() {
        return currentFrame;
    }
    self.goToFrame = function(frame) {
        currentFrame = frame;
        self.data = self.dataFrames[currentFrame];
    }

    /* Events */
    var events = {};
    self.addEventListener = function(type, callback) {
        if(!events[type]) {
            events[type] = [];
        }
        events[type].push(callback);
    }
    self.removeEventListener = function(type, callback) {
        if(events[type]) {
            var callbacks = events[type];
            var len = callbacks.length;
            
            for(var i = 0; i < len; i++) {
                callbacks.splice(i, 1);
            }
        }
    }
    self.dispatchEvent = function(type, e) {
        if(!e) e = {};
        e.type = type;
        var callbacks = events[type];
        if(callbacks) {
            var len = callbacks.length;
            for(var i = 0; i < len; i++) {
                callbacks[i](e);
            }
        }
    }
}

/* Functions */
// Return image data object
function getImageData(img) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var imgdata;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    imgdata = ctx.getImageData(0,0, img.width, img.height);
    return imgdata;
}
// Return an array of image data objects
function getDataFrames(img, frames) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var width = img.width;
    var height = Math.floor(img.height/frames);
    var imgData = [];
    for(var i = 0; i < frames; i++) {
        imgData[i] = ctx.getImageData(0, i * height, width, height);
    }
    return imgData;
}