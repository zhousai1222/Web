(function () {
	bladeColor = "#00ff00";
	bladeWidth = 10;// * gameScale;
	var buildBlade = function (system, width) {
		function Point(x, y) {
			return {
				x: x,
				y: y
			};
		}
		function center(p1, p2) {
			return Point(p1.x * 0.5 + p2.x * 0.5, p1.y * 0.5 + p2.y * 0.5);
		}
		function direction(p1, p2) {
			var dx = p2.x - p1.x;
			var dy = p2.y - p1.y;
			var len = Math.sqrt(dx * dx + dy * dy);
			return Point(dx / len, dy / len);
		}
		if (gameState == GAME_OVER) {
			return;
		}
		var particles = system.getParticles();
		var len = particles.length;
		var inplen = (len - 2) + (len - 2 - 1);
		if (particles.length >= 3) {
			//inner points
			var inps = new Array(inplen);
			inps[0] = particles[1].position;
			loop(len - 3, function (i) {
				inps[i * 2 + 1] = center(particles[i + 1].position, particles[i + 2].position);
				inps[i * 2 + 2] = particles[i + 2].position;
			});
			//inner point directions
			var inpdirs = new Array(inplen);
			inpdirs[0] = direction(particles[0].position, particles[1].position);
			loop(inplen - 2, function (i) {
				inpdirs[i + 1] = direction(inps[i], inps[i + 2]);
			})
			inpdirs[inplen - 1] = direction(particles[len - 2].position, particles[len - 1].position);
			//innerpoint translate
			var inptrans = new Array(inplen);
			loop(inplen, function (i) {
				inptrans[i] = Point(width * inpdirs[i].y, width * inpdirs[i].x);
			});
			//way to
			context.save();
			context.beginPath();
			context.moveTo(particles[0].position.x, particles[0].position.y);
			loop(len - 3, function (i) {
				var offset = i*2;
				context.quadraticCurveTo(inps[offset].x + inptrans[offset].x, inps[offset].y - inptrans[offset].y, inps[offset + 1].x + inptrans[offset + 1].x, inps[offset + 1].y - inptrans[offset + 1].y);
			});
			context.quadraticCurveTo(inps[inplen - 1].x + inptrans[inplen - 1].x, inps[inplen - 1].y - inptrans[inplen - 1].y, particles[len-1].position.x, particles[len-1].position.y);
			//way from
			loop(len - 3, function (i) {
				var offset = inplen - i * 2 - 1;
				context.quadraticCurveTo(inps[offset].x - inptrans[offset].x, inps[offset].y + inptrans[offset].y, inps[offset - 1].x - inptrans[offset - 1].x, inps[offset - 1].y + inptrans[offset - 1].y);
			});
			context.quadraticCurveTo(inps[0].x - inptrans[0].x, inps[0].y + inptrans[0].y, particles[0].position.x, particles[0].position.y);
			context.closePath();
			context.fill();
			context.restore();
		}
	};
	var buildBlade1 = function (width) {
		if (gameState == GAME_OVER) {
			return;
		}
		var i = bladeSystem.getParticles().length;
		var lineWidth = width;
		var step = width / (i - 1);
		while (i-- > 1) {
			context.beginPath();
			if (i == 1) {
				context.lineWidth = 1;
			}
			else {
				context.lineWidth = lineWidth;
			}
			var p = bladeSystem.getParticles()[i];
			var next = bladeSystem.getParticles()[i - 1];
			context.moveTo(p.position.x, p.position.y);
			context.lineTo(next.position.x, next.position.y);
			context.stroke();
			lineWidth -= step;
			if (lineWidth <= 0) {
				lineWidth = 1;
			}
		};
	};
	buildColorBlade = function (color, width) {
	    loop(TOTAL_BLADE, function (i) {
	        context.fillStyle = "#ffffff";
	        context.strokeStyle = "#ffffff";
	        buildBlade(bladeSystems[i], width * 0.6);
	    });
	};
	buildBladeParticle = function (system, x, y) {
		var p = system.createParticle(SPP.Particle);
		p.init(x, y, 0.2);
	};
}());