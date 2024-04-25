window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;
var controller;
if (window.requestAnimationFrame && window.cancelAnimationFrame) {
  window.onload = function () {
    /* Controller */
    // Input device
    var input = new InputDevice();
    // Set keys
    input.addKey(90, BUTTON_LEFT);
    input.addKey(32, BUTTON_LAUNCH);
    input.addKey(77, BUTTON_RIGHT);
    input.addKey(13, BUTTON_PAUSE);

    // Create the controller
    controller = new Controller(input);
    // Set controller parameters
    controller.setFrameLength(10);

    /* Model elements */

    // Data
    var tableData = document.getElementById("tabledata");



    var ballData = document.getElementById("balldata");
    var bumperData = document.getElementById("bumperdata");
    var rightFlipperData = document.getElementById("rightflipperdata");
    var leftFlipperData = document.getElementById("leftflipperdata");
    var launcherData = document.getElementById("launcherdata");
    var launchSwitchData = document.getElementById("launchswitch");
    var specialDoorData = document.getElementById("specialdoor");
    var launcherDoorData = document.getElementById("launcherdoor");
    var forkData = document.getElementById("fork");
    var forkLeftDoorData = document.getElementById("forkleftdoor");
    var forkRightDoorData = document.getElementById("forkrightdoor");
    var loseSwitchData = document.getElementById("loseswitch");

    // Display objects
    var tableDisplay = new DisplaySprite(document.getElementById("tableimage"));
    var ballDisplay = new DisplaySprite(document.getElementById("ballimage"));
    var bumperDisplay = new DisplaySprite(
      document.getElementById("bumperimage"),
      3
    );
    var rightFlipperDisplay = new DisplaySprite(
      document.getElementById("rightflipperimage"),
      9
    );
    var leftFlipperDisplay = new DisplaySprite(
      document.getElementById("leftflipperimage"),
      9
    );
    var launcherDisplay = new DisplaySprite(launcherData, 13);
    var specialDoorDisplay = new DisplaySprite(specialDoorData, 2);
    var launcherDoorDisplay = new DisplaySprite(launcherDoorData, 2);
    var forkLeftDoorDisplay = new DisplaySprite(forkLeftDoorData, 2);
    var forkDisplay = new DisplaySprite(forkData, 2);
    var forkRightDoorDisplay = new DisplaySprite(forkRightDoorData, 2);

    // Flippers
    var leftFlipper = createFlipper(
      controller,
      leftFlipperData,
      leftFlipperDisplay,
      BUTTON_LEFT,
      24,
      67,
      19.5,
      -48.5,
      3
    );
    leftFlipper.x = 116;
    leftFlipper.y = 524;
    var rightFlipper = createFlipper(
      controller,
      rightFlipperData,
      rightFlipperDisplay,
      BUTTON_RIGHT,
      83,
      67,
      161.3,
      229.3,
      3
    );
    rightFlipper.x = 224;
    rightFlipper.y = 524;
    var leftFlipper2 = createFlipper(
      controller,
      leftFlipperData,
      leftFlipperDisplay,
      BUTTON_LEFT,
      24,
      67,
      19.5,
      -48.5,
      3
    );
    leftFlipper2.x = 124;
    leftFlipper2.y = 249;
    controller.addEventListener("press", function (e) {
      if (e.button & BUTTON_LEFT) {
        leftFlipper.press();
        leftFlipper2.press();
      }
      if (e.button & BUTTON_RIGHT) {
        rightFlipper.press();
      }
    });
    controller.addEventListener("release", function (e) {
      if (e.button & BUTTON_LEFT) {
        leftFlipper.release();
        leftFlipper2.release();
      }
      if (e.button & BUTTON_RIGHT) {
        rightFlipper.release();
      }
    });

    // Launcher
    var launcher = createLauncher(
      launcherData,
      launcherDisplay,
      4,
      BUTTON_LAUNCH,
      -90,
      12
    );
    launcher.x = 445;
    launcher.y = 600;
    controller.addEventListener("press", function (e) {
      if (e.button & BUTTON_LAUNCH) {
        launcher.press();
      }
    });
    controller.addEventListener("release", function (e) {
      if (e.button & BUTTON_LAUNCH) {
        launcher.release();
      }
    });

    // Doors
    var specialDoor = createDoor(specialDoorData, specialDoorDisplay, 2);
    specialDoor.x = 32;
    specialDoor.y = 90;
    var launcherDoor = createDoor(launcherDoorData, launcherDoorDisplay, 2);
    launcherDoor.x = 236;
    launcherDoor.y = 24;
    var fork = createDoor(forkData, forkDisplay, 2);
    fork.x = 383;
    fork.y = 135;
    var forkLeftDoor = createDoor(forkLeftDoorData, forkLeftDoorDisplay, 2);
    forkLeftDoor.x = 273;
    forkLeftDoor.y = 99;
    var forkRightDoor = createDoor(forkRightDoorData, forkRightDoorDisplay, 2);
    forkRightDoor.x = 302;
    forkRightDoor.y = 52;

    forkLeftDoor.setState(1);

    // Switches
    var launchSwitch = new Sprite(
      launchSwitchData,
      new DisplaySprite(launchSwitchData)
    );
    launchSwitch.x = 234;
    launchSwitch.y = 36;
    launchSwitch.door = launcherDoor;
    launchSwitch.addEventListener("ballenter", function (e) {
      var door = e.target.door;
      if (door.currentFrame() != 1) {
        door.setState(1);
      }
    });

    var loseSwitch = new Sprite(
      loseSwitchData,
      new DisplaySprite(loseSwitchData)
    );
    loseSwitch.x = 128;
    loseSwitch.y = 628;
    loseSwitch.door = launcherDoor;
    loseSwitch.addEventListener("ballenter", function (e) {
      e.target.door.setState(0);
      e.target.table.ball.x = 467;
      e.target.table.ball.y = 528;
      e.target.table.ball.vx = 0;
      e.target.table.ball.vy = 0;
    });

    // Bumpers
    var B = 7;
    var bumper1 = createBumper(bumperData, bumperDisplay, B);
    var bumper2 = createBumper(bumperData, bumperDisplay, B);
    var bumper3 = createBumper(bumperData, bumperDisplay, B);
    var bumper4 = createBumper(bumperData, bumperDisplay, B);
    var bumper5 = createBumper(bumperData, bumperDisplay, B);
    var bumper7 = createBumper(bumperData, bumperDisplay, B);
    var bumper8 = createBumper(bumperData, bumperDisplay, B);
    bumper1.x = 140;
    bumper1.y = 148;
    bumper2.x = 196;
    bumper2.y = 148;
    bumper3.x = 252;
    bumper3.y = 148;
    bumper4.x = 168;
    bumper4.y = 196;
    bumper5.x = 224;
    bumper5.y = 196;
    bumper7.x = 316;
    bumper7.y = 148;
    bumper8.x = 328;
    bumper8.y = 196;

    // Table
    var table = new Table(tableData, tableDisplay);
    table.addSprite(launcher);
    table.addSprite(leftFlipper);
    table.addSprite(rightFlipper);
    table.addSprite(leftFlipper2);
    table.addSprite(specialDoor);
    table.addSprite(launcherDoor);
    table.addSprite(launchSwitch);
    table.addSprite(loseSwitch);
    table.addSprite(fork);
    table.addSprite(forkLeftDoor);
    table.addSprite(forkRightDoor);
    table.addSprite(bumper1);
    table.addSprite(bumper2);
    table.addSprite(bumper3);
    table.addSprite(bumper4);
    table.addSprite(bumper5);
    table.addSprite(bumper7);
    table.addSprite(bumper8);

    // Ball
    var ball = new Ball(ballData, ballDisplay);
    ball.x = 250;
    ball.y = 150;

    /* Add elements to the controller and begin the game */
    controller.setBall(ball);
    controller.setTable(table);
    // Begin the game
    controller.start();

    // Show the game
    var view = new View(controller, document.getElementById("table"));
    view.start();
  };
}
// Event handler
function updateColor(e) {
  var display = e.target.display;
  display.currentFrame++;
  if (display.currentFrame >= display.frames) {
    display.currentFrame = 0;
  }
}
