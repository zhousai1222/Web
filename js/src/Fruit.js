FruitGame.Fruit = function () {
	SPP.Particle.call(this);
	this.draw = function (img) {
		this.context.drawImage(img, 0, 0, img.width, img.height, -img.width * 0.5, -img.height * 0.5, img.width, img.height);
	}
};
SPP.inherit(FruitGame.Fruit, SPP.Particle);
FruitGame.Fruit.prototype.update = function () {

	if (this.position.y > gameHeight) {
		this.life = 0;
		return;
	}

	this.rotation += this.rotationStep;

	this.context.translate(this.position.x, this.position.y);
	this.context.rotate(this.rotation);
	this.context.scale(this.scale, this.scale);
	this.draw(this.texture);
	this.context.setTransform(1, 0, 0, 1, 0, 0);
};
FruitGame.Fruit.prototype.init = function (x, y, life, tex, ctx) {

	SPP.Particle.prototype.init.apply(this, [x, y, life]);
	this.context = ctx;
	this.texture = tex;
	this.rotation = 0;
	this.scale = gameScale * 0.7;
	this.radius = tex.width >= tex.height ? tex.width * 0.5 : tex.height * 0.5;
	this.radius *= this.scale;

	this.rotationStep = sign(Math.random() - 0.5) * 0.1;
};