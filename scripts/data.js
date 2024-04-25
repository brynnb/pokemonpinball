/* Constants */
// Numbers
var GRAVITY = 0.085;
var INV_FRICTION = 0.98;
var MAX_VELOCITY = 12;
var SLOPE_SPEED = GRAVITY;

// Events
var EVENT_COLLISION = "collision";
var EVENT_BALLENTER = "ballenter";
var EVENT_BALLLEAVE = "ballleave";
var EVENT_PRESS = "press";
var EVENT_RELEASE = "release";
var EVENT_FRAME = "frame";

// Controller buttons
var BUTTON_LEFT = 1;
var BUTTON_RIGHT = 2;
var BUTTON_LAUNCH = 4;
var BUTTON_PAUSE = 8;

// Sensors
var SENSOR_SOLID = 0;
var SENSOR_UP = 1;
var SENSOR_RIGHT = 2;
var SENSOR_DOWN = 3;
var SENSOR_LEFT = 4;
var SENSOR_SLOPE = 5;
var SENSOR_LISTENER = 6;

// Math
var MATH_PI_2 = 0.5 * Math.PI;
var MATH_2PI = 2 * Math.PI;
var INV_2PI = 1/MATH_2PI;

// Error codes
var ERROR_INVALID_IMAGE_DIMENSIONS = 1; // Image must have width and height multiples of 16

/* Math */
var sin = [];
var cos = [];
for(i = 0; i < 256; i++) {
    sin[i] = Math.sin(2 * Math.PI * i / 256);
    cos[i] = Math.cos(2 * Math.PI * i / 256);
}