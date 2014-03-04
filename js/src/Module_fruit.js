(function () {

	//jucie
	drawDrop = function () {
		juicePool.foreach(function (el) {
			el.draw(context);
		});
	};
	var buildJuice = function (target, juiceCount) {
		loop(juiceCount, function (i) {
			var juice = juiceSystem.createParticle(SPP.SpriteImage);
			juice.init(target.position.x, target.position.y, 0.5, target.fruit.j, context);
			juice.scale = Math.random() * 0.3 * (gameScale * 0.7);
			juice.damp.reset(0, 0);
			juice.velocity.reset(0, -(4 + Math.random() * 4));
			juice.velocity.rotate(360 * Math.random());
			juice.addForce("g", gravity);

			juice.addEventListener("dead", function () {

				ui_scoreBottle.up();

				var drop = Element(ImageObject(target.fruit.j));
				drop.translateX = juice.position.x;
				drop.translateY = juice.position.y;
				drop.scale = juice.scale;

				var index = juicePool.add(drop);
				TweenLite.to(drop, 0.8, {
					translateX: gameWidth * 0.5,
					translateY: gameHeight - 550,
//					scale: 0.0,
//					alpha: 0.0,
					ease: Power3.easeOut,
					onComplete: function () {
						juicePool.remove(index);
					}
				});
			});
		});
	};
	//splash
	drawSplash = function () {
		splashPool.foreach(function (el) {
			el.draw(context);
		});
	};
	var buildSplash = function (target) {
		var splash = Element(ImageObject(target.fruit.s));
		var index = splashPool.add(splash);
		splash.translateX = target.position.x;
		splash.translateY = target.position.y;
		splash.scale = (1 + Math.random()) * (gameScale * 0.7);
		splash.rotation = Math.PI * 2 * Math.random();
		TweenLite.to(splash, 2.0, {
			alpha: 0,
			ease: Linear.none,
			onComplete: function () {
				splashPool.remove(index);
			}
		});
	};

	//half fruit
	var buildHalfFruit = function (target) {

		var speed = 3 + Math.random() * 3;

		var right = halfFruitSystem.createParticle(FruitGame.Fruit);
		right.init(target.position.x, target.position.y, Infinity, target.fruit.r, context);
		right.velocity.reset(0, -speed);
		right.velocity.rotate(20 * Math.random());
		right.damp.reset(0, 0);
		right.rotation = target.rotation;
		right.addForce("g", gravity);

		var left = halfFruitSystem.createParticle(FruitGame.Fruit);
		left.init(target.position.x, target.position.y, Infinity, target.fruit.l, context);
		left.velocity.reset(0, -speed);
		left.velocity.rotate(-20 * Math.random());
		left.damp.reset(0, 0);
		left.rotation = target.rotation;
		left.addForce("g", gravity);
	};

	//throw fruit
	throwFruit = function () {
		var fruit = assetsManager.getRandomFruit();

/*		//center version
		var mainVelocity = gameHeight / 35.0;
		var floatVelocity = mainVelocity * 0.2;
		var mainRotate = 0;
		var floatRotate = 20;
		var mainX = gameWidth*0.5;
		var floatX = gameWidth * 0.25;

		var p = fruitSystem.createParticle(FruitGame.Fruit);
		p.velocity.reset(0, -mainVelocity + rand2() * floatVelocity);
		p.velocity.rotate(mainRotate + rand2() * floatRotate);
		p.damp.reset(0, 0);
		p.addForce("g", gravity);

		p.init(mainX + rand2() * floatX, gameHeight, Infinity, fruit.w, context);
		p.fruit = fruit;
*/
		//left right version
		var mainVelocity = gameHeight / 30.0;
		var floatVelocity = mainVelocity * 0.1;
		var mainRotate = 35;
		var floatRotate = 5;
		var mainY = gameHeight - 100;
		var floatY = 50;

		var direction = rand2() < 0;

		var p = fruitSystem.createParticle(FruitGame.Fruit);
		p.velocity.reset(0, -mainVelocity + rand2() * floatVelocity);
		p.velocity.rotate((direction ? mainRotate : -mainRotate) + rand2() * floatRotate);
		p.damp.reset(0, 0);
		p.addForce("g", gravity);

		p.init(direction? 0:gameWidth, mainY + rand2() * floatY, Infinity, fruit.w, context);
		p.fruit = fruit;
	};

	//cut fruit
	cutFruit = function (target) {
		score++;
		if (score > MAX_SCORE) {
			gameWin();
		}

		assetsManager.splatter.play();
		buildHalfFruit(target);
		buildJuice(target, 10);
		buildSplash(target);

		target.life = 0;
	};

}());