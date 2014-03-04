(function () {
	//new game
	drawNewGame = function () {
		ui_newGame.draw(context);
	}
	buildNewGame = function () {
		var newgame = ImageObject(assetsManager.newgame);
		ui_newGame = Element(newgame);
		ui_newGame.translateX = gameWidth - 200;
		ui_newGame.translateY = 300;
		ui_newGame.scale = 5 * gameScale;
		ui_newGame.alpha = 0;
		ui_newGame.visibility = false;

		var start = null;
		var cutStart = function () {
			//hide ui
			TweenLite.to(ui_newGame, 0.8, {
				scale: 8 * gameScale,
				alpha: 0,
				onComplete: function () {
					ui_newGame.visibility = false;
				}
			});
			//start
			startGame();
		};
		var showStartFruit = function () {

			var fruit = assetsManager.getRandomFruit();

			start = fruitSystem.createParticle(FruitGame.Fruit);
			start.init(ui_newGame.translateX, ui_newGame.translateY, Infinity, fruit.w, context);
			start.rotationStep = -0.02;
			start.scale = 0;
			start.alpha = 0;
			start.fruit = fruit;

			start.addEventListener("dead", cutStart);

			TweenLite.to(start, 0.2, { scale: gameScale * 0.7, alpha: 1 });
		};
		ui_newGame.changeStartFruit = function () {
			start.removeEventListener("dead", cutStart);
			start.addEventListener("dead", showStartFruit);
			TweenLite.to(start, 0.2, {
				scale: 0,
				alpha: 0,
				onComplete: function () {
					start.life = 0;
				}
			});
		}
		var rotate = function () {
			if (ui_newGame.visibility === true) {
				ui_newGame.rotate = 0.0;
				TweenLite.to(ui_newGame, 10, { rotate: 360, ease: Linear.easeNone, onComplete: rotate });
			}
		};
		ui_newGame.show = function () {
			//ui
			ui_newGame.visibility = true;
			TweenLite.to(ui_newGame, 0.8, {
				scale: gameScale*1.4,
				alpha: 1,
				onComplete: rotate
			});
			//fruit
			showStartFruit();
		};
	}
	
	//game over
	drawGameOver = function () {
		if (ui_gameOver !== null) {
			ui_gameOver.draw(context);
		}
	}
	showGameoverUI = function (tex) {
		ui_gameOver = Element(ImageObject(tex));
		ui_gameOver.translateX = gameWidth * 0.5;
		ui_gameOver.translateY = gameHeight * 0.5;
		ui_gameOver.scale = 0;
		TweenLite.to(ui_gameOver, 0.8, { scale: 1, ease: Back.easeOut, onComplete: gameOverComplete });

		ui_timer.hide();
	};
	function gameOverComplete() {
		setTimeout(replay, 2000);
//		canvas.addEventListener('click', replay, false);
	};
	function replay(e) {
//		canvas.removeEventListener('click', replay, false);
		hideGameoverUI();
	};
	function hideGameoverUI() {
		TweenLite.to(ui_gameOver, 0.8, { scale: 0, ease: Back.easeIn, onComplete: gameoverUIHideComplete });
	};
	function gameoverUIHideComplete() {

		ui_gameOver = null;

		gameState = GAME_READY;

		ui_newGame.show();
		ui_scoreBottle.hidefull();
	};

	function ImageSelector(imgs,width,gap,wing) {
		//present
		var present = 0;
		//lock for rolling
		var lock = 0;
		//elements
		var len = imgs.length;
		var imgobjs = new Array(len);
		loop(len, function (i) {
			imgobjs[i] = ImageObject(imgs[i]);
			imgobjs[i].centerY = 1.0;
		});
		var center = wing + 1;
		var repeat = 0;
		var infos = new Array();
		while (len * repeat < center * 2) {
			repeat++;
			loop(len, function (i) {
				infos.push(Element(imgobjs[i]));
			});
		}
		var replen = repeat * len;
		function id(offset) {
			return (present + replen + offset) % replen;
		}
		//position
		var positions = (function () {
			function Position(translateX, scale, alpha) {
				return {
					translateX: translateX,
					scale: scale,
					alpha: alpha
				};
			}
			var rst = new Array(center * 2 + 1);
			rst[center] = Position(0.0, 1.0, 1.0);
			var dist = width * 0.5 + gap;
			loop(center, function (i) {
				var diff = i + 1;
				var rate = (center - diff) / center;
				dist += width * 0.5 * rate;
				rst[center - diff] = Position(-dist, rate, rate);
				rst[center + diff] = Position(+dist, rate, rate);
				dist += (width * 0.5 + gap) * rate;
			});
			return rst;
		})();
		loop(center * 2 - 1, function (i) {
			infos[id(i - wing)].translateX = positions[i + 1].translateX;
			infos[id(i - wing)].scale = positions[i + 1].scale;
			infos[id(i - wing)].alpha = positions[i + 1].alpha;
		});
		//method
		return {
			draw: function (ctx) {
				//rolling
				if (lock>0) {
					infos[id(-(wing+1))].draw(ctx);
				}
				loop(wing, function (i) {
					var index = wing - i;
					infos[id(+index)].draw(ctx);
					infos[id(-index)].draw(ctx);
				});
				infos[id(0)].draw(ctx);
			},
			next: function () {
				if (lock == 0) {
					lock = center * 2;
					present++;
					loop(center * 2, function (i) {
						infos[id(i - center)].translateX = positions[i + 1].translateX;
						infos[id(i - center)].scale = positions[i + 1].scale;
						infos[id(i - center)].alpha = positions[i + 1].alpha;
					});
					loop(center * 2, function (i) {
						TweenLite.to(infos[id(i - center)], 0.5, {
							translateX: positions[i].translateX,
							scale: positions[i].scale,
							alpha: positions[i].alpha,
							onComplete: function () { lock--; }
						});
					});
					assetsManager.slide.play();
				}
			},
			present: function () {
				return present % len;
			}
		};
	}

	//selector
	buildSelector = function () {

		target = 0;

		var imgs = new Array(3);
		loop(3, function (i) {
			imgs[i] = assetsManager.productsArray[i].f;
		});
		var selector = ImageSelector(imgs, imgs[0].width, 50, 1);
		canvas.addEventListener('click', function (e) {
			if (gameState === GAME_READY) {
				selector.next();
				target = selector.present();
				ui_newGame.changeStartFruit();
			}
		}, false);

		ui_selector = Element(selector);
		ui_selector.scale = 1.0;
		ui_selector.translateX = gameWidth / 2.0;
		ui_selector.translateY = gameHeight - 30;
	}
	drawSelector = function () {
		if (gameState === GAME_READY) {
			ui_selector.draw(context);
		}
	};

	//background
	buildBackground = function () {

		var bgimg = ImageObject(assetsManager.background);
		bgimg.centerX = 0.0;
		bgimg.centerY = 0.0;

		ui_background = Element(bgimg);
		ui_background.scale = gameScale;
	}
	drawBackground = function () {
		ui_background.draw(context);
	};

	//score bottle
	buildScoreBottle = function () {

		ui_scoreBottle = new Array(3);

		var products = new Array(3);

		loop(3, function (i) {

			products[i] = new Object();

			var product = assetsManager.productsArray[i];

			products[i].full = ImageObject(product.f);
			products[i].full.centerY = 1.0;
			products[i].sbfull = Element(products[i].full);
			products[i].sbfull.visibility = false;

			products[i].empty = ImageObject(product.e);
			products[i].empty.centerY = 1.0;
			products[i].sbempty = Element(products[i].empty);

			products[i].cap = ImageObject(product.c);
			products[i].cap.centerY = 1.0;
			products[i].sbcap = Element(products[i].cap);
			products[i].sbcap.translateY = 0;

			products[i].juice = ImageObject(product.j);
			products[i].juice.centerY = 1.0;
			products[i].sbjuice = Element(products[i].juice);
		});

		ui_scoreBottle = Element({
			draw: function (ctx) {
				if (gameState === GAME_PLAYING || gameState === GAME_OVER) {
					products[target].sbjuice.draw(ctx);
					products[target].sbempty.draw(ctx);
					products[target].sbcap.draw(ctx);
					products[target].sbfull.draw(ctx);
				}
			}
		});
		ui_scoreBottle.showfull = function () {
			products[target].sbfull.visibility = true;
		}
		ui_scoreBottle.hidefull = function () {
			products[target].sbfull.visibility = false;
		}
		ui_scoreBottle.score = function (score) {
			products[target].juice.clipHeight = score;
			products[target].juice.clipY = 1 - score;
		}
		var down = false;
		var up = false;
		var cooldown = null;
		ui_scoreBottle.up = function () {
			//stop move down
			if (down) {
				TweenLite.killTweensOf(products[target].sbcap);
			}
			//move up
			if (!up) {
				up = true;
				TweenLite.to(products[target].sbcap, 0.3, { translateY: -80 });
			}
			//wait for move down
			if (cooldown != null) {
				clearTimeout(cooldown);
			}
			cooldown = setTimeout(function () {
				cooldown = null;
				up = false;
				down = true;
				TweenLite.to(products[target].sbcap, 0.3, { translateY: 0, onComplete: function () { down = false; } });
			}, 900);
		}
		ui_scoreBottle.translateX = gameWidth / 2.0;
		ui_scoreBottle.translateY = gameHeight - 30;
	}
	drawScoreBottle = function () {
		if (gameState === GAME_PLAYING || gameState === GAME_OVER) {
			ui_scoreBottle.score(score / MAX_SCORE);
			ui_scoreBottle.draw(context);
		}
	};

	//clock
	buildTimer = function () {

		var face = ImageObject(assetsManager.clockface);
		face.centerX = 0.516;
		face.centerY = 0.536;
		var clockface = Element(face);

		var pointer = ImageObject(assetsManager.clockpointer);
		pointer.centerX = 0.516;
		pointer.centerY = 0.536;
		var clockpointer = Element(pointer);

		ui_timer = Element({
			draw: function (ctx) {
				clockface.draw(ctx);
				clockpointer.draw(ctx);
			}
		});
		ui_timer.time = function (time) {
			clockpointer.rotate = time * 360;
		};
		ui_timer.show = function () {
			ui_timer.scale = 10.0;
			ui_timer.alpha = 0.0;
			ui_timer.visibility = true;
			TweenLite.to(ui_timer, 0.8, {
				scale: 1.0,
				alpha: 1.0
			});
		};
		ui_timer.hide = function () {
			TweenLite.to(ui_timer, 0.8, {
				scale: 0.0,
				alpha: 0.0,
				onComplete: function () {
					ui_timer.visibility = false;
				}
			});
		};
		ui_timer.visibility = false;
		ui_timer.translateX = gameWidth - 200;
		ui_timer.translateY = 300;
	}
	drawTimer = function () {
		if (gameState === GAME_PLAYING || gameState === GAME_OVER) {
			if (gameState === GAME_PLAYING) {
				ui_timer.time(timer / MAX_TIME);
			}
			else{
				ui_timer.time(1.0);
			}
			ui_timer.draw(context);
		}
	};

}());