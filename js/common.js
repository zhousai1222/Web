function loop(total, op) {
	var i;
	for (i = 0; i < total; i++) {
		op(i);
	}
}

function sign(x) {
	return x < 0 ? -1 : 1;
}

function rand2() {
	return (Math.random() - 0.5) * 2;
}

function Heap() {
	var objects = new Array();
	var spaces = new Array();
	return {
		add: function (obj) {
			var index = -1;
			if (spaces.length > 0) {
				index = spaces.pop();
				objects[index] = obj;
			}
			else {
				index = objects.length;
				objects.push(obj);
			}
			return index;
		},
		get: function (index) {
			return objects[index];
		},
		remove: function (index) {
			objects[index] = null;
			spaces.push(index);
		},
		foreach: function (op) {
			loop(objects.length, function (i) {
				if (objects[i] !== null) {
					op(objects[i]);
				}
			});
		}
	};
}

function ImageObject(img) {
	return {
		centerX: 0.5,
		centerY: 0.5,
		clipX: 0.0,
		clipY: 0.0,
		clipWidth: 1.0,
		clipHeight: 1.0,
		draw: function (ctx) {
			var width = img.width * this.clipWidth;
			width = width > 1 ? width : 1;
			var height = img.height * this.clipHeight;
			height = height > 1 ? height : 1;
			var sx = img.width * this.clipX;
			var sy = img.height * this.clipY;
			var dx = sx - img.width * this.centerX;
			var dy = sy - img.height * this.centerY;
			ctx.drawImage(img, sx, sy, width, height, dx, dy, width, height);
		}
	};
}

function Element(obj) {
	return {
		translateX: 0.0,
		translateY: 0.0,
		rotate: 0.0,
		scale: 1.0,
		alpha: 1.0,
		visibility: true,
		draw: function (ctx) {
			
			if (this.visibility === true) {

				ctx.save();

				ctx.translate(this.translateX, this.translateY);
				ctx.rotate(this.rotate * Math.PI / 180.0);
				ctx.scale(this.scale, this.scale);
				ctx.globalAlpha *= this.alpha;

				obj.draw(ctx);

				ctx.restore();
			}
		}
	};
}
