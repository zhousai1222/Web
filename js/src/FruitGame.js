var FruitGame;

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;
var gameScale = Math.max(gameWidth / 1920, gameHeight / 1200);

var canvas;
var context;

//depth canvas and image canvas
var userViewerCanvasElement;
var backgroundRemovalCanvasElement;

//particle
var gravity;

var juiceSystem;
var fruitSystem;
var halfFruitSystem;

var TOTAL_BLADE = 2;
var bladeSystems;

var bombSystem;
var smokeSystem;

var bladeColor;
var bladeWidth;

var splashPool;
var juicePool;

var timer = 0;

//for blade
var mouse = {};
//for win
var score;
//for count down
var stamp = 0;
//for throw
var interval = 2.5;
//for selector
var target = 0;

var MAX_TIME = 20;
var MAX_SCORE = 10;

var GAME_READY = 1, GAME_PLAYING = 2, GAME_OVER = 3;
var gameState;

//start game ui
var ui_newGame;
var ui_startFruit;

var ui_selector;

var ui_scoreBottle;
var ui_timer;

var ui_gameover;

//collide test
var collide;
