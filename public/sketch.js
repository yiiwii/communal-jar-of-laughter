//by yiweih 04/22/2021
///////////////////////////////* MODEL *///////////////////////////////
// Global variable to store the classifier
let classifier;
// Label
let label = "listening...";
// Teachable Machine model URL:
let soundModel = "https://teachablemachine.withgoogle.com/models/y33IfamZ_/";
// Set up timer to calculate typing event
var counter = 0;
var eventTrigger = false;
var socket;
var textColor = "#323232";
var backgroundColors = ["#000000", "#e68873", "#c6e6f5"];
var isFriend = false;
var onlineNumber = 0;
var eventLabel = "Laughing";
// video background
//let capture

// Reference
// Example based on https://www.youtube.com/watch?v=urR596FsU68
// 5.17: Introduction to Matter.js - The Nature of Code
// by @shiffman
// module aliases
var Engine = Matter.Engine,
  //    Render = Matter.Render,
  World = Matter.World,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Bodies = Matter.Bodies;
let engine;
let world;
let boxes = [];
let circles = [];
let grounds = [];
let mConstraint;
let canvas;
let module = ((window.innerHeight / 100) * window.innerWidth) / 100 / 10;
let sizes = [
  module,
  module * 1.5,
  module * 0.8,
  module * 3,
  module,
  module * 1.5,
  module * 0.8
];
let colorStrings = [
  "#FFFB00",
  "#fc8e2d",
  "#00D9FF",
  "#FF0066",
  "#f1ccac",
  "#4c4cff",
  "#b967ff"
];
//["#d1face", "#ffac41", "#c5d87c", "#b0efeb", "#f1ccac","#4c4cff", "#3d5ba5", "#b967ff"]
let index = 0;

///////////////////////////////* CONTOLER *///////////////////////////////

function preload() {
  // Load the model
  classifier = ml5.soundClassifier(soundModel + "model.json");
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  //capture video
  //capture = createCapture(VIDEO);
  //capture.size(1920, 1080);

  // Start classifying
  // The sound model will continuously listen to the microphone
  classifier.classify(gotResult);

  //socket
  socket = io.connect();
  //receive trigger
  socket.on("trigger", function(data) {
    dropFriendCircle(data);
  });
  socket.on("onlineNum", arg => {
    onlineNumber = arg;
  });
  socket.on("indexNum", arg => {
    index = arg;
  });
  //matters engine setup
  engine = Engine.create();
  world = engine.world;
  grounds.push(new Boundary(0, window.innerHeight / 2, 80, window.innerHeight));
  grounds.push(
    new Boundary(
      window.innerWidth,
      window.innerHeight / 2,
      80,
      window.innerHeight
    )
  );
  grounds.push(new Boundary(200, 0, window.innerWidth * 2, 80));
  grounds.push(
    new Boundary(200, window.innerHeight, window.innerWidth * 2, 200)
  );
  World.add(world, grounds);
}

// function that counts the time of effective event, duration longer than 1s
function isEvent() {
  trigger = 1;
  if (label === eventLabel) {
    eventTrigger = true;
    return true;
  } else {
    eventTrigger = false;
    return false;
  }
}

// function that counts consecutive laughing
function eventCounter() {
  if (isEvent()) {
    counter = counter + 1;
  }
}

// Recognizing a sound will trigger this event
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
}

// function when screen is touched, burst circles
function touchStarted() {
  dropPoke();
}

// function when mouse is clicked
function mouseClicked() {
  dropPoke();
}

// function to drop circles
function dropCircle() {
  let posX = random(80, window.innerWidth - 80);
  let size = random(sizes);
  let color = colorStrings[index % colorStrings.length];
  //circles.push(new Circle(posX, 10, size / 2, color));
  circles.push(new Circle(posX, 10, size / 2, color));
  //send the data to server
  var data = { index: index, mode: "circle" };
  socket.emit("trigger", data);
  //socket.emit("playerIndex",index);
}

function dropPoke() {
  let posX = random(80, window.innerWidth - 80);
  let size = random(sizes);
  let color = colorStrings[index % colorStrings.length];
  //circles.push(new Circle(posX, 10, size / 2, color));
  circles.push(new Poke(posX, 10, size / 2, color));
  //send the data to server
  var data = { index: index, mode: "poke" };
  socket.emit("trigger", data);
  //socket.emit("playerIndex",index);
}

// function to drop friends circles
function dropFriendCircle(data) {
  let posX = random(window.innerWidth);
  let size = random(sizes);
  let color = colorStrings[data.index % colorStrings.length];
  if (data.mode === "circle") {
    circles.push(new Circle(posX, 10, size / 2, color));
  } else if (data.mode === "poke") {
    circles.push(new Poke(posX, 10, size / 2, color));
  } else {
    circles.push(new Circle(posX, 10, size / 2, color));
  }
  isFriend = true;
  label = "!Laughter Incoming!";
}

///////////////////////////////* VIEW *///////////////////////////////

// view frame
function draw() {
  console.log(label);
  eventCounter();
  if (label === eventLabel) {
    background(backgroundColors[1]);
    dropCircle();
  } else if (label !== eventLabel) {
    background(backgroundColors[0]);
    isFriend = false;
  } else if (isFriend === true) {
    background(backgroundColors[2]);
  } else {
    background(backgroundColors[0]);
  }
  drawText();
  //drawCamera();
  //drawRectangle();
  Engine.update(engine);
  for (let circle of circles) {
    circle.show();
  }
  for (let ground of grounds) {
    ground.show();
  }
  drawCredit();
}

// Draw the label in the canvas
function drawText() {
  fill(255);
  //UPPER TEXT
  if (window.innerWidth <= 500) {
    textSize(16);
  } else {
    textSize(32);
  }
  textAlign(RIGHT);
  text(label, window.innerWidth - 50, 100);
  textAlign(LEFT);
  text(`${onlineNumber} friends online`, 50, 100);

  //MIDDLE TEXT
  if (window.innerWidth <= 500) {
    textSize(56);
  } else if (window.innerWidth > 500 && window.innderWidth <= 1080) {
    textSize(80);
  } else {
    textSize(140);
  }
  textAlign(CENTER, CENTER);
  textFont("Helvetica");
  textStyle(BOLD);
  text(
    `WHEN ${onlineNumber} OF US LAUGH TOGETHER`,
    50,
    0,
    window.innerWidth - 100,
    window.innerHeight - 50
  );
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
  event.preventDefault();
};

function drawCredit() {
  // credit text
  textStyle(NORMAL);
  textSize(12);
  textAlign(LEFT);
  text("created by Yiwei Huang", 50, window.innerHeight - 50);

  textStyle(NORMAL);
  textSize(12);
  textAlign(RIGHT);
  //let a = createA('https://teachablemachine.withgoogle.com/', 'Teachable Machine');
  //a.position(window.innerWidth-50,window.innerHeight-50);
  //text(`Powered by Teachable Machine`,window.innerWidth-50,window.innerHeight-50);
}

/*
function drawCamera () {
  image(capture, 0,0,1920,1080);
}
*/
