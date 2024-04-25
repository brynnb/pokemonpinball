/* Classes */
function Controller(input) {
    var self = this;
    var running = false;
    var paused = false;
    var timer = null;
    var table = null;
    var ball = null;
    var frameLength = 16;

    self.input = input;

    self.getBall = function() {
        return ball;
    }
    self.getTable = function() {
        return table;
    }
    self.isRunning = function() {
        return running;
    }
    self.setBall = function(b) {
        ball = b;
        if(table) {
          table.ball = ball;
        }
    }
    self.setTable = function(t) {
        table = t;
        table.ball = ball;
    }
    self.setFrameLength = function(f) {
        frameLength = f;
    }

    self.start = function() {
        if(!running)  {
            running = true;
            self.frame();
        }
    }
    self.stop = function() {
        running = false;
        clearTimeout(timer);
        timer = null;
        request = null;
    }

    self.frame = function(t) {
        // Variables used in multiple places in this function
        var eventObject;

        // Begin by requesting the next frame
        if(running) {
            //timer = setTimeout(self.frame, frameLength);
            requestAnimationFrame(self.frame);
        }

        /* Update inputs */
        eventObject = { table: table, ball: ball, target: self };
        input.update();
        if(input.pressed(BUTTON_LEFT)) {
            eventObject.button = BUTTON_LEFT;
            self.dispatchEvent(EVENT_PRESS, eventObject);
        }
        if(input.pressed(BUTTON_RIGHT)) {
            eventObject.button = BUTTON_RIGHT;
            self.dispatchEvent(EVENT_PRESS, eventObject);
        }
        if(input.pressed(BUTTON_LAUNCH)) {
            eventObject.button = BUTTON_LAUNCH;
            self.dispatchEvent(EVENT_PRESS, eventObject);
        }
        if(input.pressed(BUTTON_PAUSE)) {
            eventObject.button = BUTTON_PAUSE;
            self.dispatchEvent(EVENT_PRESS, eventObject);
        }
        if(input.released(BUTTON_LEFT)) {
            eventObject.button = BUTTON_LEFT;
            self.dispatchEvent(EVENT_RELEASE, eventObject);
        }
        if(input.released(BUTTON_RIGHT)) {
            eventObject.button = BUTTON_RIGHT;
            self.dispatchEvent(EVENT_RELEASE, eventObject);
        }
        if(input.released(BUTTON_LAUNCH)) {
            eventObject.button = BUTTON_LAUNCH;
            self.dispatchEvent(EVENT_RELEASE, eventObject);
        }
        // Pause the game
        if(input.released(BUTTON_PAUSE)) {
            paused = !paused;
        }

        /* Everything in here occurs as long as the game is not paused */
        if(!paused) {
            tableMode();
        }
    }

    /* Private methods */
    function tableMode() {
        // Declare variables
        var i, j;
        var data;
        var slope;
        var solid;
        var protector;
        var sensors;
        var sprite;
        var sprites = table.sprites;
        var spritesLength = sprites.length;
        // Update ball's velocity
        if(ball.ground) {
            var before = ball.v;
            if(ball.angle < 32 || ball.angle >= 224) {
                ball.v += SLOPE_SPEED * sin[ball.angle];
            } else if(ball.angle >= 32 && ball.angle < 96) {
                ball.v += SLOPE_SPEED * cos[ball.angle];
            } else if(ball.angle >= 96 && ball.angle < 160) {
                ball.v += SLOPE_SPEED * -sin[ball.angle];
            } else {
                ball.v += SLOPE_SPEED * -cos[ball.angle];
            }
            ball.v *= INV_FRICTION;

            ball.vx = ball.v * cos[ball.angle];
            ball.vy = ball.v * sin[ball.angle];
        } else {
            ball.vy += GRAVITY;
        }

        // Make sure the velocity does not exceed the maximum allowed
        if(ball.v > MAX_VELOCITY) {
            ball.v = MAX_VELOCITY;
        } else if(ball.v < -MAX_VELOCITY) {
            ball.v = -MAX_VELOCITY;
        }

        if(ball.vx > MAX_VELOCITY) {
            ball.vx = MAX_VELOCITY;
        } else if(ball.vx < -MAX_VELOCITY) {
            ball.vx = -MAX_VELOCITY;
        }

        if(ball.vy > MAX_VELOCITY) {
            ball.vy = MAX_VELOCITY;
        } else if(ball.vy < -MAX_VELOCITY) {
            ball.vy = -MAX_VELOCITY;
        }

        // Remember the ball's previous position
        var previousX = ball.x;
        var previousY = ball.y;
        // Update the ball's position
        ball.x += ball.vx;
        ball.y += ball.vy;

        /* Events and collisions */
        // Table frame event
        table.dispatchEvent(EVENT_FRAME, { target : table, table : table, ball : ball });

        // Collision detection
        solid = false;
        protector = 0;
        sensors = null;
        do {
            protector++;
            if(protector == 100) {
                // Prevent infinite loop
                break;
            }
            data = ball.pixelHittest(table);
            if(data[SENSOR_SOLID] > 0) {
                solid = true;
                slope = data[SENSOR_SLOPE];
                ball.x += sin[slope];
                ball.y -= cos[slope];
            }
            sensors = data;
        } while(data[SENSOR_SOLID] > 0);

        if(solid) {
            // If the ball hit something solid then update the position
            ball.setSlope(slope);
        } else {
            // The ball isn't on the ground
            ball.ground = false;
        }

        // Collision with sprites
        for(i = 0; i < spritesLength; i++) {
            sprite = sprites[i];
            sprite.dispatchEvent(EVENT_FRAME, { target : sprite, table : table, ball : ball });
            solid = false;
            protector = 0;
            sensors = null;
            data = null;
            do {
                protector++;
                if(protector == 100) {
                    // Prevent infinite loop
                    break;
                }
                data = ball.pixelHittest(sprite);
                if(data[SENSOR_SOLID] > 0) {
                    solid = true;
                    slope = data[SENSOR_SLOPE];
                    ball.x += sin[slope];
                    ball.y -= cos[slope];
                }
                sensors = data;
            } while(data[SENSOR_SOLID] > 0);

            if(solid || sensors[SENSOR_LISTENER]) {
                if(!sprite.collision) {
                    sprite.collision = true;
                    sprite.dispatchEvent(EVENT_BALLENTER, { target : sprite, table : table, ball : ball, sensors : sensors, slope : slope});
                }
                sprite.dispatchEvent(EVENT_COLLISION, { target : sprite, table : table, ball : ball, sensors : sensors, slope : slope});
            } else {
                if(sprite.collision) {
                    sprite.dispatchEvent(EVENT_BALLLEAVE, { target : sprite, table : table, ball : ball, sensors : sensors, slope : slope});
                }
                sprite.collision = false;
            }
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

function InputDevice() {
    var self = this;
    var currentState = 0;
    var previousState = 0;
    var buffer = 0;
    var keys = {};

    document.body.addEventListener("keydown", keyHandler, false);
    document.body.addEventListener("keyup", keyHandler, false);

    self.addKey = function(key, button) {
        keys[key] = button;
    }

    self.press = function(button) {
        buffer |= button;
    };
    self.release = function(button) {
        buffer &= ~button;
    };
    self.update = function() {
        previousState = currentState;
        currentState = buffer;
    };
    self.pressed = function(button) {
        return !!(currentState & button) && !(previousState & button);
    };
    self.down = function(button) {
        return !!(currentState & button);
    }
    self.released = function(button) {
        return !(currentState & button) && !!(previousState & button);
    }

    self.destroy = function() {
        document.body.removeEventListener("keydown", keyHandler, false);
        document.body.removeEventListener("keyup", keyHandler, false);
    }

    /* Private methods */
    function keyHandler(e) {
        e = e ? e : window.event;
        var i;
        var key = e.keyCode ? e.keyCode : e.which;
        if(e.type == "keydown") {
            // Press buttons
            if(keys[key]) {
                self.press(keys[key]);
            }
        } else if(e.type == "keyup") {
            // Release buttons
            if(keys[key]) {
                self.release(keys[key]);
            }
        }
    }
}