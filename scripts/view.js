function View(con, can) {
    var self = this;
    var controller = con;
    var canvas = can;
    var context = canvas.getContext("2d");
    var frameLength = 16;
    var request = null;
    var running = false;

    self.debug = false;

    self.setFrameLength = function(f) {
        frameLength = f;
    }

    self.start = function() {
        if(!running)  {
            running = true;
            request = requestAnimationFrame(self.frame);
        }
    }

    self.frame = function(t) {
        var i;
        var table = controller.getTable();
        var ball = controller.getBall();

        // Clear the screen
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Show the table
        context.drawImage(table.display.image, 0, 0);

        // Show sprites
        var sprite;
        var display;
        var sprites = table.sprites;
        var spritesLength = sprites.length;
        var w, h;
        for(i = 0; i < spritesLength; i++) {
            sprite = sprites[i];
            display = sprite.display;
            w = display.width;
            h = display.height;
            context.drawImage(display.image, 0, display.currentFrame * h, w, h, sprite.x, sprite.y, w, h);
        }

        // Show the ball
        context.drawImage(ball.display.image, Math.floor(ball.x) - ball.display.width*0.5, Math.floor(ball.y) - ball.display.height*0.5);

        // End by requesting the next frame
        if(running) {
            request = requestAnimationFrame(self.frame);
        }
    }

    self.stop = function() {
        running = false;
        cancelAnimationFrame(request);
        request = null;
    }
}

function DisplaySprite(image, frames) {
    var self = this;
    var playing = false;
    if(isNaN(frames)) {
        self.frames = 1;
    } else {
        self.frames = parseInt(frames);
        if(self.frames < 1) {
            self.frames = 1;
        }
    }

    self.image = image;
    self.currentFrame = 0;
    self.width = image.width;
    self.height = Math.floor(image.height / self.frames);
    self.play = function() {
        playing = true;
    }
    self.stop = function() {
        playing = false;
    }
}