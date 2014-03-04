(function () {
	collide = new FruitGame.Collide();
	collideTest = function () {
		if (gameState == GAME_OVER) {
			return;
		}
		var fruits = fruitSystem.getParticles();

		var bombs = bombSystem.getParticles();

		loop(TOTAL_BLADE, function (i) {

		    var blade = bladeSystems[i].getParticles();
		    var l = blade.length;

		    while (l-- > 1) {
		        var p1 = blade[l];
		        var p2 = blade[l - 1];

		        for (var i in fruits) {
		            var fruit = fruits[i];
		            var isCut = collide.lineInEllipse([p1.position.x, p1.position.y], [p2.position.x, p2.position.y], [fruit.position.x, fruit.position.y], fruit.radius);
		            if (isCut) {
		                cutFruit(fruit);
		            };
		        }

		        for (var i in bombs) {
		            var bomb = bombs[i];
		            var isCut = collide.lineInEllipse([p1.position.x, p1.position.y], [p2.position.x, p2.position.y], [bomb.position.x, bomb.position.y], bomb.radius);
		            if (isCut) {
		                cutBomb(bomb);
		            };
		        }
		    }
		});
	};
}());