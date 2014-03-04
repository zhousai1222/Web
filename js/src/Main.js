window.onload = loadAssets;

function InitKinect() {
    var streamImageWidth = 640;
    var streamImageHeight = 480;
    var streamImageResolution = streamImageWidth.toString() + "x" + streamImageHeight.toString();

    var isSensorConnected = false;
    var engagedUser = null;
    var cursor = null;
    var userViewerCanvasElement = null;
    var backgroundRemovalCanvasElement = null;


    // Log errors encountered during sensor configuration
    function configError(statusText, errorData) {
        console.log((errorData != null) ? JSON.stringify(errorData) : statusText);
    }

    // Determine if the specified object has any properties or not
    function isEmptyObject(obj) {
        if (obj == null) {
            return true;
        }

        var numProperties = 0;

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                ++numProperties;
            }
        }

        return numProperties <= 0;
    }

    // Show or hide a canvas element
    function setCanvasVisibility(canvasElement, isVisible) {
        if (canvasElement == null) {
            return;
        }

        var canvasQuery = $(canvasElement);

        if (isVisible) {
            if (!canvasQuery.hasClass("showing")) {
                // Clear canvas before showing it
                var canvasContext = canvasElement.getContext("2d");
                canvasContext.clearRect(0, 0, streamImageWidth, streamImageHeight);
            }

            canvasQuery.addClass("showing");
        } else {
            canvasQuery.removeClass("showing");
        }
    }

    // Update sensor state and perform UI transitions (showing/hiding appropriate UI elements)
    // related to sensor status or engagement state changes
    var delayedConfigTimeoutId = null;
    function updateUserState(newIsSensorConnected, newEngagedUser, sensorToConfig) {
        var hasEngagedUser = engagedUser != null;
        var newHasEngagedUser = newEngagedUser != null;

        // If there's a pending configuration change when state changes again, cancel previous timeout
        if (delayedConfigTimeoutId != null) {
            clearTimeout(delayedConfigTimeoutId);
            delayedConfigTimeoutId = null;
        }

        if ((isSensorConnected != newIsSensorConnected) || (engagedUser != newEngagedUser)) {
            if (newIsSensorConnected) {

                var immediateConfig = {};
                var delayedConfig = {};
                immediateConfig[Kinect.INTERACTION_STREAM_NAME] = { "enabled": true };
                immediateConfig[Kinect.USERVIEWER_STREAM_NAME] = { "resolution": streamImageResolution };

                //    immediateConfig[Kinect.SKELETON_STREAM_NAME] = { "enabled": true };

                immediateConfig[Kinect.BACKGROUNDREMOVAL_STREAM_NAME] = { "resolution": streamImageResolution };

                setCanvasVisibility(userViewerCanvasElement, !newHasEngagedUser);
                setCanvasVisibility(backgroundRemovalCanvasElement, newHasEngagedUser);

                if (newHasEngagedUser) {
                    immediateConfig[Kinect.BACKGROUNDREMOVAL_STREAM_NAME].enabled = true;
                    immediateConfig[Kinect.BACKGROUNDREMOVAL_STREAM_NAME].trackingId = newEngagedUser;

                    delayedConfig[Kinect.USERVIEWER_STREAM_NAME] = { "enabled": false };
                } else {
                    immediateConfig[Kinect.USERVIEWER_STREAM_NAME].enabled = true;

                    if (hasEngagedUser) {
                        delayedConfig[Kinect.BACKGROUNDREMOVAL_STREAM_NAME] = { "enabled": false };
                    }
                }



                // Perform immediate configuration
                sensorToConfig.postConfig(immediateConfig, configError);

                // schedule delayed configuration for 2 seconds later
                if (!isEmptyObject(delayedConfig)) {
                    delayedConfigTimeoutId = setTimeout(function () {
                        sensorToConfig.postConfig(delayedConfig, configError);
                        delayedConfigTimeoutId = null;
                    }, 2000);
                }
            } else {
                setCanvasVisibility(userViewerCanvasElement, false);
                setCanvasVisibility(backgroundRemovalCanvasElement, false);
            }
        }

        isSensorConnected = newIsSensorConnected;
        engagedUser = newEngagedUser;

    }

    // Get the id of the engaged user, if present, or null if there is no engaged user
    function findEngagedUser(userStates) {
        var engagedUserId = null;

        for (var i = 0; i < userStates.length; ++i) {
            var entry = userStates[i];
            if (entry.userState == "engaged") {
                engagedUserId = entry.id;
                break;
            }
        }

        return engagedUserId;
    }

    // Respond to user state change event
    function onUserStatesChanged(newUserStates) {
        var newEngagedUser = findEngagedUser(newUserStates);

        updateUserState(isSensorConnected, newEngagedUser, sensor);
    }

    // Create sensor and UI adapter layers
    window.connected = false;

    var sensor = Kinect.sensor(Kinect.DEFAULT_SENSOR_NAME, function (sensorToConfig, isConnected) {
        if (isConnected) {
            // Determine what is the engagement state upon connection
            sensorToConfig.getConfig(function (data) {
                var engagedUserId = findEngagedUser(data[Kinect.INTERACTION_STREAM_NAME].userStates);

                updateUserState(true, engagedUserId, sensorToConfig);
            });
            window.connected = true;
        } else {
            //unconnected
            window.connected = false;
            updateUserState(false, engagedUser, sensorToConfig);
        }
    });
    window.uiAdapter = KinectUI.createAdapter(sensor);

    userViewerCanvasElement = document.getElementById("userViewerCanvas");
    backgroundRemovalCanvasElement = document.getElementById("backgroundRemovalCanvas");

    var userVCtx = userViewerCanvasElement.getContext("2d");
    userVCtx.globalAlpha = 0.3;
    var userRCtx = backgroundRemovalCanvasElement.getContext("2d");
    userRCtx.globalAlpha = 0.3;

    uiAdapter.bindStreamToCanvas(Kinect.USERVIEWER_STREAM_NAME, userViewerCanvasElement);
    uiAdapter.bindStreamToCanvas(Kinect.BACKGROUNDREMOVAL_STREAM_NAME, backgroundRemovalCanvasElement);

    sensor.addEventHandler(function (event) {
        switch (event.category) {
            case Kinect.USERSTATE_EVENT_CATEGORY:
                switch (event.eventType) {
                    case Kinect.USERSTATESCHANGED_EVENT_TYPE:
                        onUserStatesChanged(event.userStates);
                        break;
                }
                break;
        }
    });
}
function loadAssets() {
	assetsManager = new FruitGame.AssetsManager();
	assetsManager.addEventListener("complete", init);
	assetsManager.start();
};
function init() {

    InitKinect();

	//cursor
	document.body.style["cursor"] = "none";

	//canvas
	canvas = document.getElementById("display");
	canvas.style["display"] = "block";
	canvas.style["position"] = "absolute";
	canvas.style["left"] = "0px";
	canvas.style["top"] = "0px";
	canvas.style["width"] = gameWidth + "px";
	canvas.style["height"] = gameHeight + "px";
	canvas.width = gameWidth;
	canvas.height = gameHeight;
	context = canvas.getContext("2d");
	context.textAlign = "left";
	context.textBaseline = "top";

	//bg
	buildBackground();

	//selector
	buildSelector();

	//score
	buildScoreBottle();

	//timer
	buildTimer();

	//data 
	resetGameData();

	//ui
	ui_gameOver = null;
	ui_newGame = null;

    //force
	gravity = new SPP.Gravity();
	gravity.init(0.6);

    //fruit & juice
	juiceSystem = new SPP.ParticleSystem();
	fruitSystem = new SPP.ParticleSystem();
	halfFruitSystem = new SPP.ParticleSystem();
	splashPool = Heap();
	juicePool = Heap();

    //bomb
	bombSystem = new SPP.ParticleSystem();
	smokeSystem = new SPP.ParticleSystem();

    //blade
	bladeSystems = new Array(TOTAL_BLADE);
	loop(TOTAL_BLADE, function (i) {
	    bladeSystems[i] = new SPP.ParticleSystem();
	});

	starSystem = new SPP.ParticleSystem();

	juiceSystem.start();
	fruitSystem.start();
	halfFruitSystem.start();

	bombSystem.start();
	smokeSystem.start();

	loop(TOTAL_BLADE, function (i) {
	    bladeSystems[i].start();
	});

	starSystem.start();

	
	    uiAdapter.on(KinectUI.HANDPOINTERS_UPDATED, function (handPointers) {

	        var handPointer = null;

	        function clamp(value, min, max) {
	            return Math.max(min, Math.min(max, value));
	        }

	        loop(TOTAL_BLADE, function (i) {
	            var curPointer = handPointers[i];
	            if (curPointer !== null) {
	                var xPos = clamp(curPointer.x, 0, gameWidth);
	                var yPos = clamp(curPointer.y, 0, gameHeight);
	                if (gameState !== GAME_OVER) {
	                    buildBladeParticle(bladeSystems[i], xPos, yPos);
	                }
	            }
	        });

	        /*
                    for (var iPointer = 0; iPointer < handPointers.length; ++iPointer) {
                        var curPointer = handPointers[iPointer];
            
                        if (curPointer.getIsPrimaryHandOfPrimaryUser()) {
                            handPointer = curPointer;
                            break;
                        }
                    }
                    if (handPointer == null) {
                        return;
                    }
            
                    function clamp(value, min, max) {
                        return Math.max(min, Math.min(max, value));
                    }
                    if (handPointer != null) {
                        var xPos = clamp(handPointer.x, 0, window.innerWidth);
                        var yPos = clamp(handPointer.y, 0, window.innerHeight);
                        mouse.x = xPos;
                        mouse.y = yPos;
                        if (gameState !== GAME_OVER) {
                            buildBladeParticle(mouse.x, mouse.y);
                        }
                    }
            */
	    });

	    if (window.connected===false) {
    
	    
	  
	        function clamp(value, min, max) {
	            return Math.max(min, Math.min(max, value));
	        };
	        $(document).mousemove(function (e) {
	            loop(TOTAL_BLADE, function (i) {
	                var curPointer = { x: e.pageX, y: e.pageY };
	                if (curPointer !== null) {
	                    var xPos = clamp(curPointer.x, 0, gameWidth);
	                    var yPos = clamp(curPointer.y, 0, gameHeight);
	                    if (gameState !== GAME_OVER) {
	                        buildBladeParticle(bladeSystems[i], xPos, yPos);
	                    }
	                }
	            });
	        });
	}

    

	buildNewGame();

	ui_bgm = assetsManager.bgm.playLooping();

	gameState = GAME_READY;

	ui_newGame.show();

	render();

};

function resetGameData() {
	score = 0;
	timer = 0;
	stamp = 0;
}
function startGame() {
	resetGameData();
	gameState = GAME_PLAYING;
	ui_timer.show();
}
function renderTimer() {
	if (gameState != GAME_PLAYING) {
		return;
	}
	timer += SPP.frameTime;
	if (timer >= stamp + interval) {
		stamp = timer;
		throwObject();
	}
	if (timer > MAX_TIME) {
		gameOver();
	}
};
function throwObject() {
	loop(Math.random() * 2 + 1, function (i) {
		assetsManager.throwFruit.play();
		if (Math.random() > 0.07) {
			throwFruit();
		}
		else {
			throwBomb();
		}
	});
}
function showCongratulation() {
	loop(10, function (i) {

		var p = starSystem.createParticle(FruitGame.Fruit);

		p.init(gameWidth * Math.random(), -300 * gameScale * Math.random(), Infinity, assetsManager.star, context);

		p.velocity.reset(0, 10);
		p.damp.reset(0, 0);

		p.scale = 0.5 * Math.random() * gameScale;
	});
}
function gameWin() {

	if (gameState == GAME_OVER) {
		return;
	}
	resetGameData();
	gameState = GAME_OVER;

	var product = assetsManager.productsArray[target]
	//coupon
	ui_scoreBottle.showfull();
	showGameoverUI(product.a);
	//stars
	setTimeout(showCongratulation, 0);
	setTimeout(showCongratulation, 500);
	setTimeout(showCongratulation, 1000);
	//audio
	ui_bgm.pause();
	product.wc.play();
	assetsManager.win.play();
	setTimeout(ui_bgm.resume, 3500);
};
function gameOver() {
	if (gameState == GAME_OVER) {
		return;
	}
	gameState = GAME_OVER;
	showGameoverUI(assetsManager.gameover);
	assetsManager.lose.play();
	var leak = function () {
		if (score > 0.01) {
			score -= 0.05;
			setTimeout(leak, 15);
		}
		else {
			resetGameData();
		}
	}
	leak();
};

//render canvas
function render() {

	requestAnimationFrame(render);

	//context.clearRect(0, 0, gameWidth, gameHeight);

	drawBackground();

	drawSplash();

	drawSelector();

	drawNewGame();

	//particle system
	fruitSystem.render();
	halfFruitSystem.render();
	juiceSystem.render();

	bombSystem.render();
	smokeSystem.render();

	loop(TOTAL_BLADE, function (i) {
	    bladeSystems[i].render();
	});

	drawDrop();
	drawScoreBottle();
	drawTimer();

	drawGameOver();

	starSystem.render();

	buildColorBlade(bladeColor, bladeWidth);
	collideTest();
	renderTimer();
};
