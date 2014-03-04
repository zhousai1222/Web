(function() {
	// throw bomb
	var bombSmokeUpdate = function() {
		this.scale -= 0.03;
		if (this.scale < 0)
		{
			this.scale = 0;
			this.life = 0;
		}
	};
	var bombUpdate = function() {
		var smoke = smokeSystem.createParticle(SPP.SpriteImage);
		var r = assetsManager.bomb.width * 0.4;
		var px = this.position.x + r * Math.cos(this.rotation - SPP.MathUtils.toRadian(45));
		var py = this.position.y + r * Math.sin(this.rotation - SPP.MathUtils.toRadian(45));
		smoke.init(px, py, Infinity, assetsManager.smoke, context);
		smoke.onUpdate = bombSmokeUpdate;
		smoke.scale = gameScale;
		smoke.damp.reset(0, 0);
		smoke.velocity.reset(0, -(1 + Math.random() * 1));
		smoke.velocity.rotate(360 * Math.random());
		smoke.addForce("g", gravity);
	};
	// bomb explode
	var explodeSmokeUpdate = function() {
		this.scale -= 0.02;
		if (this.scale < 0)
		{
			this.scale = 0;
			this.life = 0;
		}
	};
	var bombExplode = function(target) {
		for ( var i = 0; i < 20; i++)
		{
			var smoke = smokeSystem.createParticle(SPP.SpriteImage);
			smoke.init(target.position.x, target.position.y, Infinity, assetsManager.smoke, context);
			smoke.onUpdate = explodeSmokeUpdate;
			smoke.scale = gameScale*10;
			smoke.damp.reset(0, 0);
			smoke.velocity.reset(0, -(3 + Math.random() * 7));
			smoke.velocity.rotate(360 * Math.random());
			smoke.addForce("g", gravity);
		}
		assetsManager.bombExplode.play();
	};
	throwBomb = function() {

/*		//center version
		var mainVelocity = gameHeight / 35.0;
		var floatVelocity = mainVelocity * 0.2;
		var mainRotate = 0;
		var floatRotate = 20;
		var mainX = gameWidth * 0.5;
		var floatX = gameWidth * 0.25;

		var p = bombSystem.createParticle(FruitGame.Fruit);
		p.velocity.reset(0, -mainVelocity + rand2() * floatVelocity);
		p.velocity.rotate(mainRotate + rand2() * floatRotate);
		p.damp.reset(0, 0);
		p.addForce("g", gravity);

		p.onUpdate = bombUpdate;

		p.init(mainX + rand2() * floatX, gameHeight, Infinity, assetsManager.bomb, context);
*/
		//left right version
		var mainVelocity = gameHeight / 30.0;
		var floatVelocity = mainVelocity * 0.1;
		var mainRotate = 35;
		var floatRotate = 5;
		var mainY = gameHeight - 100;
		var floatY = 50;

		var direction = rand2() < 0;

		var p = bombSystem.createParticle(FruitGame.Fruit);
		p.velocity.reset(0, -mainVelocity + rand2() * floatVelocity);
		p.velocity.rotate((direction ? mainRotate : -mainRotate) + rand2() * floatRotate);
		p.damp.reset(0, 0);
		p.addForce("g", gravity);

		p.onUpdate = bombUpdate;

		p.init(direction ? 0 : gameWidth, mainY + rand2() * floatY, Infinity, assetsManager.bomb, context);
	};
	// cut bomb
	cutBomb = function(target) {
		bombExplode(target);
		target.life = 0;
		gameOver();
	};
}());