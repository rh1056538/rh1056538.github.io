function documentReady(fn){
	if(document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
		fn();
	}else{
		document.addEventListener('DOMContentLoaded', fn);
	}
}

function Kaleidoscope(renderElement, targetElement, hoverElement, colorHoverElement){

	this.renderEl = renderElement;
	this.targetEl = targetElement;
	this.hoverEl = hoverElement;
	this.colorEl = colorHoverElement;

	this.mouseMoveInt = undefined;
	this.userAFK = false;
	this.userMouseInfo = {x: 0, y:0};
	this.awayTime = 0;

	this.lastRotation = 0;

	this.hoverEffect = false;

	this.block = undefined;

	this.size = {};
	this.target = {};

	this.maxDistance = 0;

	this.backgroundIsChanging = false;
	this.resizing = false;

	this.init = function(){
		this.getWindowSizes();
		this.defineBlock();
		this.generateGrid();
		if(!this.detectmob()){
			this.getTargetSizes();
			this.getTargetDistance();
			this.initEvents(true);
		}else{
			this.initEvents();
		}
		return;
	}

	this.getWindowSizes = function(){
		this.size = {
			h: window.innerHeight,
			w: window.innerWidth,
			xh: null,
			xw: null
		}
		return;
	}

	this.defineBlock = function(){
		var str = '';
		let h = ~~(this.size.h / 2);
		let w = ~~(2*h / Math.sqrt(3));
		if(w%2) w++;
		str += '<div class="firstAngle">';
			str += '<div class="secondAngle">';
				str += '<div class="holder">';
					str += '<div class="clearAngle">';
						str += '<div class="clearHeigth">';
							str += '<svg height="' + h + '" width="' + w + '" viewBox="0 0 692.8 600">';
								str += '<polygon points="0,600 346.4,0 692.8,600 "/>';
								str += '<polygon points="519.6,300 346.4,600 173.2,300 "/>';
								str += '<line x1="346.4" y1="0" x2="346.4" y2="600"/>';
								str += '<line x1="519.6" y1="300" x2="0" y2="600"/>';
								str += '<line x1="173.2" y1="300" x2="692.8" y2="600"/>';
							str += '</svg>';
						str += '</div>';
					str += '</div>';
				str += '</div>';
			str += '</div>';
		str += '</div>';
		this.block = str;
		this.size.xh = h;
		this.size.xw = w;
		return;
	}

	this.generateGrid = function(){
		this.renderEl.innerHTML += '<div class="gradientBackground" id="gradientBackground"></div>';
		for(var k = 0; k < 2; k++){
			var out = '<div class="row">';
			for(var i = 0 - (this.size.xw/2), j = k; i < this.size.w; i += this.size.xw / 2, j++){
				var string = '<div class="_kInstance';
				if(j%2){
					string += ' reversed';
				}else{
					string += ' normal';
				}
				string += '" style="left:' + i + 'px;width:' + this.size.xw + 'px;top:' + k*this.size.xh + 'px;height:' + this.size.xh + 'px">';
				string += this.block;
				string += '</div>';
				out += string;
			}
			out += '</div>';
			this.renderEl.innerHTML += out;
		}
		return;
	}

	this.getTargetSizes = function(){
		let a = this.targetEl.getBoundingClientRect();
		let b = document.body.scrollTop;
		let c = document.body.scrollLeft;
		this.target = {
			y0: a.top + b,
			y1: a.top + b + a.height,
			x0: a.left + c,
			x1: a.left + c + a.width,
			w: a.width,
			h: a.height
		}
		if(this.target.w < 1){ this.target.w = 42; }
		if(this.target.h < 1){ this.target.w = 27; }
		return;
	}

	this.getMaxDitance = function(){
		var tmp = {x: null, y: null, objX: null, objY: null};
		if(this.target.x0 > window.innerWidth - this.target.x1){
			tmp.x = 0;
			tmp.objX = this.target.x0;
		}else{
			tmp.x = window.innerWidth;
			tmp.objX = this.target.x1;
		}
		if(this.target.y0 > window.innerHeight - this.target.y1){
			tmp.y = 0;
			tmp.objY = this.target.y0;
		}else{
			tmp.y = window.innerHeight;
			tmp.objY = this.target.y1;
		}
		let a = Math.abs(tmp.objY - tmp.y);
		let b = Math.abs(tmp.objX - tmp.x);
		let c = Math.sqrt( a*a + b*b );
		this.maxDistance = c;
		return;
	}

	this.getTargetDistance = function(){
		let a = this.hoverEl.getElementsByTagName('span')[0].getBoundingClientRect();
		let b = document.body.scrollTop;
		let c = document.body.scrollLeft;
		let d = a.left + 8 + c - this.target.x1;
		let e = a.top + ~~(a.height/2) + b - this.target.y1;
		let f = Math.sqrt( d*d + e*e );
		if(f != 0){
			this.maxDistance = f;
		}else{
			this.getMaxDitance();
		}
		return;
	}

	this.initEvents = function(full = false){
		var node = this;
		var refreshRate = undefined;
		var nextState = 1;
		window.addEventListener('resize', function(e){
			if(node.resizing){
				return;
			}
			node.resizing = true;
			node.renderEl.innerHTML = '';
			node.getWindowSizes();
			node.defineBlock();
			node.generateGrid();
			if(!node.detectmob()){
				node.getTargetSizes();
				node.getTargetDistance();
			}
			node.resizing = false;
		});
		if(!full){
			return;
		}
		document.addEventListener('mousemove', function(e){
			console.log(e.x, e.y);
			if(node.awayTime <= 500){
				node.awayTime = 0;
				node.userMouseInfo.x = e.clientX;
				node.userMouseInfo.y = e.clientY;
				node.changeBackground(e.clientX, e.clientY);
			}else{
				node.awayTime = 0;
				node.userMouseInfo.x = e.clientX;
				node.userMouseInfo.y = e.clientY;
				node.renderEl.className += ' getLoss';
				node.changeBackground(e.clientX, e.clientY);
				setTimeout(function(){
					node.renderEl.className = node.renderEl.className.replace(' getLoss', '');
					node.backgroundIsChanging = false;
				}, 300);
			}
			clearInterval(node.mouseMoveInt)
			node.mouseMoveInt = setInterval(function(){
				node.awayTime += 50;
				if(node.awayTime > 500 && node.awayTime <= 1000){
					node.userMouseInfo.x += 0.5;
					node.userMouseInfo.y += 0.5;
					node.changeBackground(node.userMouseInfo.x, node.userMouseInfo.y);
				}else if(node.awayTime > 1000 && node.awayTime <= 1500){
					node.userMouseInfo.x++;
					node.userMouseInfo.y++;
					node.changeBackground(node.userMouseInfo.x, node.userMouseInfo.y);
				}else if(node.awayTime > 1500){
					node.userMouseInfo.x += 1.5;
					node.userMouseInfo.y += 1.5;
					node.changeBackground(node.userMouseInfo.x, node.userMouseInfo.y);
				}
			}, 50);
			return;
		});
		this.colorEl.addEventListener('mouseover', function(e){
			if(node.hoverEffect){
				return;
			}
			node.hoverEffect = true;
			node.renderEl.className = 'kaleidoscope active t1';
			refreshRate = setInterval(function(){
				switch(nextState){
					case 1: node.renderEl.className = 'kaleidoscope active t1 before'; break;
					case 2: node.renderEl.className = 'kaleidoscope active t1 before after'; break;
					case 3: node.renderEl.className = 'kaleidoscope active t2'; break;
					case 4: node.renderEl.className = 'kaleidoscope active t2 before'; break;
					case 5: node.renderEl.className = 'kaleidoscope active t1'; nextState = 0; break;
				}
				nextState++;
			}, 3000);
			return;
		});
		this.colorEl.addEventListener('mouseleave', function(e){
			clearInterval(refreshRate);
			node.hoverEffect = false;
			refreshRate = undefined;
			nextState = 1;
			node.renderEl.className = 'kaleidoscope';
			return;
		});
		return;
	}

	this.changeBackground = function(x, y){
		function getDefault(rotation){
			if(rotation > 360){
				return getDefault(rotation - 360);
			}else{
				return rotation;
			}
		}
		if(this.backgroundIsChanging){
			return;
		}
		this.backgroundIsChanging = true;
		let dist = this.getDistance(x, y);
		let perc = (100/this.maxDistance) * dist;
		var rotation = 210*(perc/100);
		rotation = getDefault(rotation);
		this.lastRotation = rotation;
		var arr = this.renderEl.getElementsByClassName('_kInstance');
		for(var i = 0; i < arr.length; i++){
			if(arr[i].className.indexOf('reversed') >= 0){
				arr[i].getElementsByTagName('svg')[0].style.transform = 'rotate(' + (rotation) + 'deg)';
			}else{
				arr[i].getElementsByTagName('svg')[0].style.transform = 'rotate(' + (0 - rotation) + 'deg)';
			}
		}
		this.backgroundIsChanging = false;
		return;
	}

	this.getDistance = function(mouseX, mouseY){
		let x = 0;
		if(mouseX < this.target.x0){
			x = this.target.x0 - mouseX;
		}else if(mouseX > this.target.x1){
			x = mouseX - this.target.x1;
		}
		let y = 0;
		if(mouseY < this.target.y0){
			y = this.target.y0 - mouseY;
		}else if(mouseY > this.target.y1){
			y = mouseY - this.target.y1;
		}
		return Math.sqrt( x*x + y*y );
	}

	this.detectmob = function(){ 
		if(	navigator.userAgent.match(/Android/i)
			|| navigator.userAgent.match(/webOS/i)
			|| navigator.userAgent.match(/iPhone/i)
			|| navigator.userAgent.match(/iPad/i)
			|| navigator.userAgent.match(/iPod/i)
			|| navigator.userAgent.match(/BlackBerry/i)
			|| navigator.userAgent.match(/Windows Phone/i)
		){
			return true;
		}else{
			return false;
		}
	}

}

function Logo(parentElement){

	this.element = parentElement;

	this.dynPoint = {};
	this.statPoint = {};

	this.alreadyTriggered = false;
	this.mouseIsIn = false;

	this.ellipse = {x: 50, y: 8.86751, w: 110, h: 40};

	this.disabledHover = false;

	this.init = function(){
		this.definePoints();
		this.generateLogo();
		this.initEvents();
		return;
	}

	this.definePoints = function(){
		this.dynPoint.p1 = {x: 0, y: 0};
		this.dynPoint.p2 = {x: 50, y: 28.86751};
		this.dynPoint.p3 = {x: 100, y: 0};

		this.statPoint = {x: 50, y: 86.60254};
		return;
	}

	this.generateLogo = function(){
		let str = '';

		str += '<svg viewBox="0 0 110 97.60254">';
			str += '<polygon id="logo_P123" points="5,11 55,39.86751 105,11"></polygon>';
			str += '<line id="logo_P1" x1="' + (this.dynPoint.p1.x + 5) + '" y1="' + (this.dynPoint.p1.y + 11) + '" x2="' + (this.statPoint.x + 5) + '" y2="' + (this.statPoint.y + 11) + '"></line>';
			str += '<line id="logo_P2" x1="' + (this.dynPoint.p2.x + 5) + '" y1="' + (this.dynPoint.p2.y + 11) + '" x2="' + (this.statPoint.x + 5) + '" y2="' + (this.statPoint.y + 11) + '"></line>';
			str += '<line id="logo_P3" x1="' + (this.dynPoint.p3.x + 5) + '" y1="' + (this.dynPoint.p3.y + 11) + '" x2="' + (this.statPoint.x + 5) + '" y2="' + (this.statPoint.y + 11) + '"></line>';
		str += '</svg>';

		this.element.innerHTML = str;
		return;
	}

	this.initEvents = function(){
		var node = this;
		this.element.addEventListener('mouseover', function(e){
			node.mouseIsIn = true;
			if(node.disabledHover || node.alreadyTriggered){
				return;
			}
			node.disabledHover = true;
			node.alreadyTriggered = true;
			node.rotate(250, function(){
				node.rotate(250, function(){
					node.rotate(350, function(){
						node.rotate(700, function(){
							node.disabledHover = false;
							if(!node.mouseIsIn && node.alreadyTriggered){
								node.alreadyTriggered = false;
							}
						}, true, true);
					}, true);
				}, true);
			});
		});
		this.element.addEventListener('mouseleave', function(e){
			node.mouseIsIn = false;
			if(!node.disabledHover){
				node.alreadyTriggered = false;
			}
		});
		this.element.addEventListener('click', function(e){
			if(node.disabledHover){
				return;
			}
			node.disabledHover = true;
			setTimeout(function() {
				node.rotate(250, function(){
					node.rotate(250, function(){
						node.rotate(350, function(){
							node.rotate(700, function(){
								node.disabledHover = false;
							}, true, true);
						}, true);
					}, true);
				});
			}, 0);
		});
		return;
	}

	this.rotate = function(time, callback, end = false, unlimited = false){
		time = Math.floor(time/10)*10;

		let els = { // Elements
			p1: document.getElementById('logo_P1'),
			p2: document.getElementById('logo_P2'),
			p3: document.getElementById('logo_P3'),
			p123: document.getElementById('logo_P123')
		};

		let sVals = { // Start Values
			p1: this.dynPoint.p1,
			p2: this.dynPoint.p2,
			p3: this.dynPoint.p3
		};

		let cVals = { // Values on circles
			p1: Math.PI - (Math.acos(2*(this.dynPoint.p1.x - this.ellipse.x)/this.ellipse.w) - Math.PI),
			p2: Math.acos(2*(this.dynPoint.p2.x - this.ellipse.x)/this.ellipse.w),
			p3: 2*Math.PI - Math.acos(2*(this.dynPoint.p3.x - this.ellipse.x)/this.ellipse.w)
		};

		let increment = (2*Math.PI)/(time/10);

		let i = 0;
		let j = 10;
		let node = this;

		let timer = setInterval(function() {
			cVals.p1 -= increment;
			els.p1.setAttribute('x1', (Math.cos(cVals.p1)*(node.ellipse.w/2))+(node.ellipse.x)+5);
			els.p1.setAttribute('y1', (Math.sin(cVals.p1)*(node.ellipse.h/2))+(node.ellipse.y)+11);

			cVals.p2 -= increment;
			els.p2.setAttribute('x1', (Math.cos(cVals.p2)*(node.ellipse.w/2))+(node.ellipse.x)+5);
			els.p2.setAttribute('y1', (Math.sin(cVals.p2)*(node.ellipse.h/2))+(node.ellipse.y)+11);

			cVals.p3 -= increment;
			els.p3.setAttribute('x1', (Math.cos(cVals.p3)*(node.ellipse.w/2))+(node.ellipse.x)+5);
			els.p3.setAttribute('y1', (Math.sin(cVals.p3)*(node.ellipse.h/2))+(node.ellipse.y)+11);

			let pString = ((Math.cos(cVals.p1)*(node.ellipse.w/2))+(node.ellipse.x)+5) + ',' + ((Math.sin(cVals.p1)*(node.ellipse.h/2))+(node.ellipse.y)+11);
			pString += ' ' + ((Math.cos(cVals.p2)*(node.ellipse.w/2))+(node.ellipse.x)+5) + ',' + ((Math.sin(cVals.p2)*(node.ellipse.h/2))+(node.ellipse.y)+11);
			pString += ' ' + ((Math.cos(cVals.p3)*(node.ellipse.w/2))+(node.ellipse.x)+5) + ',' + ((Math.sin(cVals.p3)*(node.ellipse.h/2))+(node.ellipse.y)+11);
			els.p123.setAttribute('points', pString);

			i += j;
			if(end){
				if(unlimited){
					if(j >= 1){
						j = j*0.985;
						increment = increment*0.985;
					}else if(j >= 0.4 && i > time-30){
						j = j*0.97;
						increment = increment*0.97;
					}
				}else{
					if(j >= 5){
						j = j*0.98;
						increment = increment*0.98;
					}
				}
			}
			if(i >= time){
				clearInterval(timer);
				els.p1.setAttribute('x1', (sVals.p1.x + 5));
				els.p1.setAttribute('y1', (sVals.p1.y + 11));
				els.p2.setAttribute('x1', (sVals.p2.x + 5));
				els.p2.setAttribute('y1', (sVals.p2.y + 11));
				els.p3.setAttribute('x1', (sVals.p3.x + 5));
				els.p3.setAttribute('y1', (sVals.p3.y + 11));
				els.p123.setAttribute('points', (sVals.p1.x + 5) + ',' + (sVals.p1.y + 11) + ' ' + (sVals.p2.x + 5) + ',' + (sVals.p2.y + 11) + ' ' + (sVals.p3.x + 5) + ',' + (sVals.p3.y + 11));
				if(callback){
					callback();
				}
			}
		}, 10);
		return;
	}

}

function Shuffle(){

	this.elements = undefined;
	this.shuffleElements = undefined;

	this.letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z','0','1','2','3','4','5','6','7','8','9','@','#','$','%','^','&','*'];

	this.refresher = undefined;

	this.changing = false;
	this.curent = undefined;

	this.init = function(){
		this.initElements();
		this.initEvents();
		this.startTimer();
		return;
	}

	this.initElements = function(){
		this.elements = document.getElementsByClassName('shuffleHover');
		for(var i = 0; i < this.elements.length; i++){
			let val = this.elements[i].innerHTML;
			this.elements[i].setAttribute('original', val);
			this.elements[i].innerHTML = '';
			for(var j = 0; j < val.length; j++){
				this.elements[i].innerHTML += '<span class="singleLetter" original="' + val[j] + '">' + val[j] + '</span>';
			}
		}
		return;
	}

	this.initEvents = function(){
		var node = this;
		for(let i = 0; i < this.elements.length; i++){
			this.elements[i].addEventListener('mouseenter', function(e){
				node.targetElement(this);
				node.changing = true;
			});
			this.elements[i].addEventListener('mouseleave', function(e){
				node.changing = false;
				node.setToOriginal(this);
			});
		}
	}

	this.targetElement = function(el){
		this.curent = el;
		this.shuffleElements = el.getElementsByClassName('singleLetter');
	}

	this.setToOriginal = function(el){
		var arr = el.getElementsByClassName('singleLetter');
		for(var i = 0; i < arr.length; i++){
			arr[i].innerHTML = arr[i].getAttribute('original');
		}
		this.curent = undefined;
	}

	this.startTimer = function(){
		var node = this;
		var timer = setInterval(function(){
			node.shuffleLetters();
		}, 100);
	}

	this.shuffleLetters = function(){
		if(this.changing && typeof this.curent != "undefined"){
			let arr = this.letters;
			let letterIndex = Math.floor(Math.random()*this.shuffleElements.length);
			if(this.shuffleElements[letterIndex].innerHTML == this.shuffleElements[letterIndex].getAttribute('original')){
				this.shuffleElements[letterIndex].innerHTML = arr[Math.floor(Math.random()*arr.length)];
			}else{
				this.shuffleElements[letterIndex].innerHTML = this.shuffleElements[letterIndex].getAttribute('original');
			}
		}
	}

}


documentReady(function(){

	setTimeout(function() {
		var k = new Kaleidoscope(
			document.getElementById('kaleidoscope'),
			document.getElementById('kaleidoscopeTarget'),
			document.getElementById('studies'),
			document.getElementById('colorHover')
		);
		k.init();

		var l = new Logo(document.getElementById('kaleidoscopeTarget'));
		l.init();

		var s = new Shuffle();
		s.init();
	}, 50);


});