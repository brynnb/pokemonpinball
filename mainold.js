import CONSTANTS from "./constants.js";

("use strict");
gameCanvas.width = innerWidth;
gameCanvas.height = innerHeight;
const canvasContext = gameCanvas.getContext("2d");

// enable mouse
const ENHANCED = 0;

// pinball constants
const TABLE_WIDTH = 400;
const TABLE_HEIGHT = 830;
const MAX_BALL_HEIGHT = TABLE_HEIGHT + 200;
const CENTER = TABLE_WIDTH / 2 + 100;
const BALL_RADIUS = 20;
const WALL_RADIUS = 9;
const DOME_RADIUS = 257;
const FLIPPER_RADIUS = 15;
const FLIPPER_PIECES = 65;
const FLIPPER_SPACE = 70;
const FLIPPER_CENTER = CENTER - BALL_RADIUS - WALL_RADIUS;
const FLIPPER_HEIGHT = TABLE_HEIGHT - 40;
const SHOOTER_HEIGHT = TABLE_HEIGHT - 40;
const SHOOTER_MAX_HEIGHT = TABLE_HEIGHT - 10;
const FLIPPER_COUNT = 2;
const BALL_INDEX = FLIPPER_COUNT;
const RESTITUTION = 1.3;
const BUMPER_RESTITUTION = 1.7;
const PHYSICS_SUBSTEPS = 9;

// object types
const OBJECT_TYPE_WALL = 0;
const OBJECT_TYPE_BUMPER = 1;

// let index, secondaryIndex, deltaX, deltaY, speed, height, object, frameCount;
// local variables
let i, j, dx, dy, speed, height, o, frame;

// global variables
let objects, score, ballCount;

// spawn object
let makeObject = (
  x,
  y, // position
  t, // type and bumper strength
  r = WALL_RADIUS // radius
) => objects.push({ x, y, t, r, v: 0, w: 0 });

let drawCircle = (x, y, r) =>
  canvasContext.beginPath(canvasContext.fill(canvasContext.arc(x, y, r, 0, 9)));

// int global variables
objects = [(ballCount = 3), 1];

// make ball and init
makeObject((frame = score = 0), MAX_BALL_HEIGHT);

// flippers and shooter
for (i = FLIPPER_PIECES; i--; ) {
  for (speed = FLIPPER_COUNT; speed--; ) makeObject();
  makeObject(
    CENTER + DOME_RADIUS - BALL_RADIUS,
    SHOOTER_MAX_HEIGHT,
    OBJECT_TYPE_WALL,
    6
  );
}

// build symmetric table
for (speed = 2; speed--; ) {
  
  // bottom pin between flippers
  makeObject(FLIPPER_CENTER, FLIPPER_HEIGHT + 36);

  // score bumpers
  const BUMPER_CENTER = 180;
  makeObject(CENTER, BUMPER_CENTER, OBJECT_TYPE_BUMPER, 15);
  makeObject(
    CENTER + (speed * 2 - 1) * 60,
    BUMPER_CENTER - 60,
    OBJECT_TYPE_BUMPER,
    45
  );
  makeObject(
    CENTER + (speed * 2 - 1) * 60,
    BUMPER_CENTER + 60,
    OBJECT_TYPE_BUMPER,
    45
  );

  // side walls
  for (i = 115; i--; )
    makeObject(
      CENTER + (speed * 2 - 1) * (DOME_RADIUS + WALL_RADIUS),
      TABLE_HEIGHT - 7 * i
    );

  // safety bumpers
  makeObject(
    FLIPPER_CENTER + (speed * 2 - 1) * 182,
    FLIPPER_HEIGHT - 221,
    OBJECT_TYPE_BUMPER,
    15
  );

  for (i = 60; i--; ) {
    // shooter wall
    makeObject(
      505,
      TABLE_HEIGHT - 7 * i
    );
    // console.log(TABLE_HEIGHT - 7 * i)

    // top dome
    const DOME_BOTH_RADIUS = DOME_RADIUS + WALL_RADIUS;
    makeObject(
      CENTER + (speed * 2 - 1) * DOME_BOTH_RADIUS * Math.cos(i / 38),
      DOME_BOTH_RADIUS - DOME_BOTH_RADIUS * Math.sin(i / 38)
    );

    console.log(CENTER + (speed * 2 - 1) * DOME_BOTH_RADIUS * Math.cos(i / 38))
    console.log(      DOME_BOTH_RADIUS - DOME_BOTH_RADIUS * Math.sin(i / 38)  )

    //test arc
    makeObject(
      CENTER + (speed * 2 - 1) * DOME_BOTH_RADIUS * Math.cos(i / 38),
      DOME_BOTH_RADIUS - DOME_BOTH_RADIUS * Math.sin(i / 38)
    );
  }

  for (i = 19; i--; ) {
    // flipper lane side
    makeObject(
      FLIPPER_CENTER + (speed * 2 - 1) * (FLIPPER_SPACE + 74),
      FLIPPER_HEIGHT - 63 - i * 7
    );

    // flipper lane bottom
    makeObject(
      FLIPPER_CENTER + (speed * 2 - 1) * (FLIPPER_SPACE + 74 - i * 4),
      FLIPPER_HEIGHT - 63 + i * 3
    );

    // slingshots
    makeObject(
      FLIPPER_CENTER + (speed * 2 - 1) * (FLIPPER_SPACE + 20 + i),
      FLIPPER_HEIGHT - 70 - i * 3,
      OBJECT_TYPE_BUMPER,
      5
    );

  }
}

// main game loop
const update = (substep) => {

    

  // update physics
  for (substep = PHYSICS_SUBSTEPS; substep--; ) {
    // flippers
    for (speed = FLIPPER_COUNT; speed--; ) {
      // control flipper angle
      objects[speed] = Math.max(
        -1,
        Math.min(1, (objects[speed] += objects["zx"[speed]] ? -0.07 : 0.05))
      );

      // update flipper and shooter physics
      for (i = FLIPPER_PIECES; i--; ) {
        // update flippers
        o = objects[1 + FLIPPER_COUNT + speed * FLIPPER_PIECES + i];
        o.v =
          -o.x +
          (o.x =
            FLIPPER_CENTER +
            (speed * 2 - 1) *
              (FLIPPER_SPACE - i * Math.cos(objects[speed] / 2)));
        o.w = -o.y + (o.y = FLIPPER_HEIGHT + i * Math.sin(objects[speed] / 2));
        o.r = FLIPPER_RADIUS - i / 8;

        // update shooter
        o = objects[1 + FLIPPER_COUNT + FLIPPER_COUNT * FLIPPER_PIECES + i];
        o.y = Math.min(
          SHOOTER_MAX_HEIGHT + i, // clamp shooter pos
          (o.y += o.w =
            objects["c"]
              ? 0.05 // pull back shooter
              : Math.sin(++frame) / 99 + // randomness
                (SHOOTER_HEIGHT + i - o.y) / 19)
        ); // shooter spring
      }
    }

    // clear canvas and get ball
    gameCanvas.width |= o = objects[BALL_INDEX];

    // update ball movement and gravity
    o.x += o.v;
    o.y += o.w += 0.0017;

    // check if ball is out
    if (o.y > MAX_BALL_HEIGHT && ballCount) {
      // respawn ball
      o.x = CENTER + DOME_RADIUS - BALL_RADIUS;
      o.y = FLIPPER_HEIGHT - 20;
      o.w = o.v = 0;
      ballCount--;
    }

    // draw background image
    const bg = new Image();
    bg.src = "assets/images/pinballbg.png";
    var bgwidth = 192;
    var bgheight = 278;    
    var x = CENTER - (bgwidth * 3) / 2;
    var y = TABLE_HEIGHT / 2 - (bgheight * 3) / 2;
    var xOffset = 20; //because the pokemon pinball bg isn't centered
    canvasContext.drawImage(bg, x + xOffset, y, bgwidth * 3, bgheight * 3);
    
    // make everything transparent grey to help position geometry behind images
    canvasContext.fillStyle = 'rgba(128, 128, 128, 0.5)';

    // for each object
    objects.map((p) => {
      // draw object
      substep || // fix local var being created in minified
        canvasContext.beginPath(
          canvasContext.fill(
            canvasContext.arc(p.x, p.y, p.b ? --p.b + p.r : p.r, 0, 9)
          )
        );

      // get collision distance
      height = Math.hypot((dx = o.x - p.x), (dy = o.y - p.y));

      // relative velocity
      i = p.v - o.v;
      j = p.w - o.w;

      // resolve collision
      if (
        (height - o.r - p.r < 0) & // is inside
        (i * dx + j * dy > 0) & // moving towards
        !(p.t & !o.v)
      ) {
        // can collide
        // move outside collision
        o.x -= ((height - o.r - p.r) * dx) / height;
        o.y -= ((height - o.r - p.r) * dy) / height;

        // tangent length
        height *= height / (j * dx - i * dy);

        // get restitution and update bumper
        speed =
          !p.t | p.b
            ? RESTITUTION
            : // start bounce animation
              ((p.b = 9),
              // don't give score for slingshots
              p.y > 600
                ? 0
                : // apply score and award extra balls
                  ++score % 64 || ++ballCount,
              // make it bouncy
              BUMPER_RESTITUTION);

        // reflect velocity and bounce
        o.v += (i + dy / height) * speed;
        o.w += (j - dx / height) * speed;
      }
    });
  }

  // draw score
  for (i = (score + 8) >> 3; i--; )
    drawCircle(
      CENTER - DOME_RADIUS - 40 - (i % 8) * 20,
      420 + i * 3,
      i ? 9 : score % 8
    );

};

// keyboard input
onkeydown = (e) => (objects[e.key] = 1);
onkeyup = (e) => (objects[e.key] = 0);

if (!ENHANCED) setInterval(update, 16); // 60 fps update
else {
  // enhanced rendering system for smoother frame rate
  let frameTimeLastMS = 0,
    frameTimeBufferMS = 0;
  const updateAnimation = (frameTimeMS = 0) => {
    requestAnimationFrame(updateAnimation);

    // update time keeping
    let frameTimeDeltaMS = frameTimeMS - frameTimeLastMS;
    frameTimeLastMS = frameTimeMS;
    frameTimeBufferMS += frameTimeDeltaMS;
    frameTimeBufferMS = Math.min(frameTimeBufferMS, 50);

    // apply time delta smoothing, improves smoothness of framerate in some browsers
    let deltaSmooth = 0;
    if (frameTimeBufferMS < 0 && frameTimeBufferMS > -9) {
      // force an update each frame if time is close enough (not just a fast refresh rate)
      deltaSmooth = frameTimeBufferMS;
      frameTimeBufferMS = 0;
    }

    // update multiple frames if necessary in case of slow framerate
    for (; frameTimeBufferMS >= 0; frameTimeBufferMS -= 1e3 / 60) update();

    // add the time smoothing back in
    frameTimeBufferMS += deltaSmooth;
  };

  updateAnimation();

  // responsive canvas size
  onresize = (e) => {
    gameCanvas.width = innerWidth;
    gameCanvas.height = innerHeight;
  };
  onresize();




}
