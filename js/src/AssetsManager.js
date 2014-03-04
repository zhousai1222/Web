FruitGame.AssetsManager=function() 
{
	SPP.EventDispatcher.call(this);

	var _this = this;

	var fruitsDir="assets/fruits/";
	var fruitStateLabels = ["w", "l", "r", "s", "j"];

	var productsDir = "assets/products/";
	var productStateLabels = ["f", "e", "j", "c", "a"];

	this.fruitsObj={};
	this.fruitsArray=[];

	this.productsObj = {};
	this.productsArray = [];

	//loder
	function Loader() {
		//storage
		var objects = new Object();

		//load complete callback
		var total = 0;
		var count = 0;
		var start = -1;
		var completeHandler = null;
		var onLoad = function () {
			count++;
			if (start === 0) {
				if (count == total) {
					start++;
					if (completeHandler !== null) {
						completeHandler();
					}
				}
			}
		};

		//load functions
		function loadImage(src, cb) {
			var img = new Image();
			img.onload = cb;
			img.src = src;
			return img;
		}
		function loadAudio(src, cb) {
			cb();
			return {
				play: function () {
					var ado = new Audio();
					ado.src = src;
					ado.play();
				},
				playLooping: function () {
					var ado = new Audio();
					ado.src = src;
					ado.loop = true;
					ado.play();
					return {
						pause: function () {
							ado.pause();
						},
						resume: function () {
							ado.play();
						}
					};
				}
			};
		}
		function loadBySuffix(src, cb) {
			var suffix = src.substr(-3);
			if (suffix === "png") {
				return loadImage(src, cb);
			}
			else if (suffix === "mp3") {
				return loadAudio(src, cb);
			}
			else {
				return null;
			}
		}
		function loadFile(obj) {
			total++;
			objects[obj.id] = loadBySuffix(obj.src, onLoad);
		}

		//interface
		return {
			load: function(){
				start++;
			},
			loadFile: loadFile,
			loadManifest: function (objs) {
				loop(objs.length, function (i) {
					loadFile(objs[i]);
				});
			},
			onComplete: function(h){
				completeHandler = h;
			},
			getResult: function (id) {
				return objects[id];
			}
		};
	};

	this.loader = Loader();

	var handleComplete = function ()
	{
		//fruits
		var fruits = FruitGame.assets.fruits;
		loop(fruits.length, function (p) {
			var pfs = fruits[p];
			var rst = new Array();
			loop(pfs.length, function (i) {
				var obj = new Object();
				loop(fruitStateLabels.length, function (j) {
					obj[fruitStateLabels[j]] = _this.loader.getResult(pfs[i] + fruitStateLabels[j]);
				});
				_this.fruitsObj[pfs[i]] = obj;
				rst.push(obj);
			});
			_this.fruitsArray.push(rst);
		});

		//products
		var products = FruitGame.assets.products;
		loop(products.length, function (i) {
			var obj = {};
			loop(productStateLabels.length, function (j) {
				obj[productStateLabels[j]] = _this.loader.getResult(products[i] + productStateLabels[j]);
			});
			obj["w" + "c"] = _this.loader.getResult(products[i] + "w" + "c");
			_this.productsArray.push(obj);
			_this.productsObj[products[i]] = obj;
		});

		//other
		var other = FruitGame.assets.other;
		loop(other.length, function (i) {
			_this[other[i].id] = _this.loader.getResult(other[i].id);
		});

		//complete
		_this.dispatchEvent(new SPP.Event("complete"));
	};
	this.loader.onComplete(handleComplete);
	
	this.start=function()
	{
		//fruits
		var fruits=FruitGame.assets.fruits;
		loop(fruits.length, function (p) {
			var pfs = fruits[p];
			loop(pfs.length, function (i) {
				loop(fruitStateLabels.length, function (j) {
					_this.loader.loadFile({
						id: pfs[i] + fruitStateLabels[j],
						src: fruitsDir + pfs[i] + "-" + fruitStateLabels[j] + ".png"
					}, false);
				});
			});
		});

		//products
		var products = FruitGame.assets.products;
		loop(products.length, function (i) {
			var obj = {};
			loop(productStateLabels.length, function (j) {
				_this.loader.loadFile({
					id: products[i] + productStateLabels[j],
					src: productsDir + products[i] + "-" + productStateLabels[j] + ".png"
				}, false);
			});
			_this.loader.loadFile({
				id: products[i] + "w" + "c",
				src: productsDir + products[i] + "-" + "c" + ".mp3"
			}, false);
		});

		//other
		this.loader.loadManifest(FruitGame.assets.other,false);

		//start
		this.loader.load();
	};
	this.getRandomFruit=function()
	{
		var pfs = this.fruitsArray[target];
		return pfs[pfs.length*Math.random()>>0];
	};
};
SPP.inherit(FruitGame.AssetsManager,SPP.EventDispatcher);
