/* Flipper */
// data: The bitmap with data for collision testing
// display: The bitmap used by the view to display the sprite
// button: The button or buttons the sprite responds to (use the | operator to have multiple buttons)
// centerX, centerY: The rotation axis of the flipper relative to the top left corner of the sprite
// startAngle, endAngle: The beginning and end of the flipper's rotation when the button is pressed
// energy: Multiplied by the speed of the ball after it has been hit by the flipper
function createFlipper(controller, data, display, button, centerX, centerY, startAngle, endAngle, energy) {
    // Convert to radians
    startAngle = startAngle * MATH_2PI / 360;
    endAngle = endAngle * MATH_2PI / 360;

    var frames = display.frames;
    var angleSize = (endAngle - startAngle) / (frames - 1);

    var flipper = new AnimatedSprite(data, display, frames);
    flipper.button = button;
    flipper.moving = false;
    flipper.forward = false;
    flipper.reverse = false;
    flipper.centerX = centerX;
    flipper.centerY = centerY;
    flipper.energy = (isNaN(energy) || energy < 0) ? 1 : energy;
    flipper.angularSpeed = angleSize; // Radians per frame
    flipper.angles = [];
    for(var i = 0; i < frames; i++) {
        flipper.angles[i] = startAngle + i * angleSize;
        while(flipper.angles[i] < 0) flipper.angles[i] += MATH_2PI;
        while(flipper.angles[i] > MATH_2PI) flipper.angles[i] -= MATH_2PI;
    }

    // Event handling
    flipper.press = function() {
        this.moving = true;
    };
    flipper.release = function() {
        this.moving = false;
    };
    flipper.addEventListener("frame", function(e) {
        var flipper = e.target;
        if(flipper.moving) {
            if(flipper.currentFrame() < flipper.frames - 1) {
                flipper.forward = true;
                flipper.reverse = false;
                flipper.nextFrame();
                flipper.display.currentFrame = flipper.currentFrame();
            } else {
                flipper.forward = false;
                flipper.reverse = false;
            }
        } else if(flipper.currentFrame() > 0) {
            flipper.forward = false;
            flipper.reverse = true;
            flipper.previousFrame();
            flipper.display.currentFrame = flipper.currentFrame();
        } else {
            flipper.forward = false;
            flipper.reverse = false;
        }
    });
    flipper.addEventListener("collision", function(e) {
        var ball = e.ball;
        var flipper = e.target;
        // Flipper's current angle
        var flipperAngle = flipper.angles[flipper.currentFrame()];
        // Ball position relative to flipper center
        var xPos = ball.x - (flipper.x + flipper.centerX)
        var yPos = ball.y - (flipper.y + flipper.centerY);
        // Ball angle relative to flipper center
        var ballAngle = Math.atan2(yPos, xPos);
        if(ballAngle < 0) ballAngle += MATH_2PI;
        // Angular distance between ball and flipper
        var angularPos = Math.sin(ballAngle - flipperAngle) ; // If it is positive then the ball is ahead, otherwise it is behind

        // Check if the flipper behaves like ground or not
        //   fwd rev spd=pos gnd
        //    0   0     0     1
        //    0   0     1     1
        //    0   1     0     0 
        //    0   1     1     1
        //    1   0     1     0
        //    1   0     0     1
        //    1   1     0     X
        //    1   1     1     X
        //   !FS + !RS
        // Determine if the flipper should behave like ground
        var isEqual = flipper.angularSpeed >= 0 && angularPos >= 0 || flipper.angularSpeed < 0 && angularPos < 0;
        var isGround = false;
        var F = flipper.forward, R = flipper.reverse, S = isEqual;
        if(!F && S || !R && !S) {
            isGround = true;
        }

        // Determine action based on whether it behaves like ground or not
        if(isGround) {
            // Behave like ground
            ball.setSlope(e.slope);
        } else {
            var normal = Math.floor(flipperAngle * INV_2PI * 256) - 64;
            if(angularPos > 0) {
                normal += 128;
            }
            // Normalization of slope
            while(normal < 0) normal += 256;
            while(normal > 256) normal -= 256;
            // Speed depends on distance from center and angular speed
            var dist = Math.sqrt(xPos*xPos+yPos*yPos) - MAX_VELOCITY;
            if(dist < 0) dist = 0;
            var speed = Math.abs(flipper.angularSpeed * dist * flipper.energy);
            // Set ball parameters
            ball.ground = false;
            ball.v = speed;
            ball.angle = normal;
            ball.vx += speed * cos[normal];
            ball.vy += speed * sin[normal];
            ball.x += ball.vx;
            ball.y += ball.vy;
        }
    });
    return flipper;
}

/* Bumper */
// data: The bitmap with data for collision testing
// display: The bitmap used by the view to display the sprite
// energy: The velocity that the ball will have after hitting the bumper
function createBumper(data, display, energy) {
    var bumper = new Sprite(data, display);
    bumper.energy = (isNaN(energy) || energy < 0) ? 1 : energy;
    bumper.addEventListener("collision", function(e) {
        var ball = e.ball;
        var self = e.target;
        var centerX = self.x + self.width*0.5;
        var centerY = self.y + self.height*0.5;
        // Get ball's angle relative to the center of the bumper
        var angle = Math.floor(Math.atan2(ball.y - centerY, ball.x - centerX) * INV_2PI * 256);
        while(angle < 0) angle += 256;
        while(angle > 256) angle -= 256;
        // Set ball parameters
        ball.ground = false; // Make ball behave in air mode
        ball.v = self.energy;
        ball.angle = angle;
        ball.vx = self.energy * cos[angle];
        ball.vy = self.energy * sin[angle];
    });
    return bumper;
}

/* Launcher */
// data: The bitmap with data for collision testing
// display: The bitmap used by the view to display the sprite
// frameLength: How many frames the game engine cycles through before advancing one frame of animation
// button: The button or buttons the sprite responds to (use the | operator to have multiple buttons)
// angle: The angle that the launcher will shoot the ball
// energy: The velocity at which the ball is launched
function createLauncher(data, display, frameLength, button, angle, energy) {
    var frames = display.frames;
    var angle = Math.floor(angle * 256 / 360);
    if(isNaN(frameLength) || frameLength < 1) frameLength = 1;
    while(angle < 0) angle += 256;
    while(angle > 256) angle -= 256;

    var launcher = new AnimatedSprite(data, display, frames);
    launcher.button = button;
    launcher.angle = angle;
    launcher.energy = energy;
    launcher.power = 0;
    launcher.counter = 0;
    launcher.frameLength = frameLength;
    launcher.pull = false;
    launcher.push = false;

    launcher.frameListener = function(e) {
        var self = e.target;
        if(self.pull) {
            if(self.counter % self.frameLength == 0) {
                self.nextFrame();
            }
            self.counter++
        } else if(self.push) {
            if(self.currentFrame() == 0) {
                self.push = false;
                self.removeEventListener(self.frameListener);
            } else {
                self.previousFrame(0);
            }
        }
        self.display.currentFrame = self.currentFrame();
    }
    
    launcher.press = function() {
        var self = this;
        self.counter = false;
        self.pull = true;
        self.removeEventListener("frame", self.frameListener);
        self.addEventListener("frame", self.frameListener);
    }
    launcher.release = function() {
        var self = this;
        self.power = self.currentFrame() / (self.display.frames-1)
        self.pull = false;
        self.push = true;
    };

    launcher.addEventListener("collision", function(e) {
        var self = e.target;
        if(self.push) {
            e.ball.vx = self.power * self.energy * cos[self.angle];
            e.ball.vy = self.power * self.energy * sin[self.angle];
            e.ball.ground = false;
        } else {
            e.ball.setSlope(e.slope);
        }
    });

    return launcher;
}

/* Door */
function createDoor(data, display, states) {
    var door = new AnimatedSprite(data, display, states);
    door.setState = function(state) {
        if(isNaN(state) || state >= states || state < 0) {
            return;
        }
        door.goToFrame(state);
        door.display.currentFrame = state;
    }
    door.addEventListener("collision", function(e) {
        e.ball.setSlope(e.slope);
    });
    return door;
}