const canvasDraw = document.getElementById("canvDraw");
const ctxDraw = canvasDraw.getContext("2d");
var time = 0;
var flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var data, scale;

var col = "black",
    siz = 3;

var StrokeStore = function (stor, curr) {
    if (stor === undefined && curr === undefined) {
        this.store = [];
        this.current = [];
    } else {
        this.store = stor;
        this.current = curr;
    }
}

StrokeStore.prototype.moveTo = function (x, y) {
    if (this.current.length !== 0) {
        this.store.push(this.current);
        this.current = [];
    }
    this.current.push({
        x: x,
        y: y
    });
};

StrokeStore.prototype.lineTo = function (x, y, color, size) {
    this.current.push({
        x: x,
        y: y,
        c: color,
        s: size
    });
};

StrokeStore.prototype.stroke = function (ctx) {
    ctx.beginPath();
    var color = "black";
    var size = 2;
    var count = 0;
    ctx.lineCap = 'round';
    this.store.forEach(function (line) {
        scale = canvasDraw.width / 400;
        if (count == 0) {
            color = line[1].c;
            size = line[1].s;
            ctx.strokeStyle = color;
            ctx.lineWidth = size * scale;
        }
        if (color != line[1].color || size != line[1].size) {
            ctx.stroke();
            color = line[1].c;
            size = line[1].s;
            ctx.lineWidth = size * scale;
            ctx.strokeStyle = color;
            ctx.beginPath();
        }
        ctx.moveTo(line[0].x * scale, line[0].y * scale);
        var pt;
        pt = line[1];
        ctx.lineTo(pt.x * scale, pt.y * scale);
        count++;
    }, this);
    //this._stroke(this.current);
    ctx.stroke();
};

var strokes = new StrokeStore();

$(function () {
    $('#start').click(start);
    $('#hidetimer').click(toggleTimer);
    $('#submit').click(submit);
    $('#confirm').click(confirm);
    $('#reset').click(cancel);
    $('#resizeWindow').click(resizeCanvas);
    window.canv = -1;
    canvDraw();
});

function canvDraw() {
    window.addEventListener('resize', resizeCanvas, false);

    canvasDraw.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvasDraw.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvasDraw.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvasDraw.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
    ctxDraw.fillStyle = "white";
    ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    resizeCanvas();
}

function resizeCanvas() {
    if (window.innerWidth / 4 > 180 && window.innerWidth / 4 < 400) {
        ctxDraw.canvas.width = window.innerWidth / 4;
        ctxDraw.canvas.height = ctxDraw.canvas.width;
    }
    if (window.innerWidth / 4 <= 180) {
        ctxDraw.canvas.width = 180;
        ctxDraw.canvas.height = 180;
    }
    if (window.innerWidth / 4 >= 400) {
        ctxDraw.canvas.width = 400;
        ctxDraw.canvas.height = 400;
    }
    redraw();
}

function redraw() {
    ctxDraw.fillStyle = "white";
    ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    strokes.stroke(ctxDraw);
}

function draw() {
    scale = canvasDraw.width / 400;
    ctxDraw.lineCap = 'round';
    ctxDraw.lineWidth = siz * scale;
    ctxDraw.beginPath();
    ctxDraw.moveTo(prevX, prevY);
    ctxDraw.lineTo(currX, currY);
    ctxDraw.strokeStyle = col;
    ctxDraw.stroke();
    ctxDraw.closePath();
    scale = 400 / canvasDraw.width;
    strokes.moveTo((prevX * scale).toFixed(1), (prevY * scale).toFixed(1));
    strokes.lineTo((currX * scale).toFixed(1), (currY * scale).toFixed(1), col, siz);
}


function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvasDraw.getBoundingClientRect().left;
        currY = e.clientY - canvasDraw.getBoundingClientRect().top;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctxDraw.beginPath();
            ctxDraw.fillStyle = col;
            ctxDraw.fillRect(currX, currY, 2, 2);
            ctxDraw.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvasDraw.getBoundingClientRect().left;
            currY = e.clientY - canvasDraw.getBoundingClientRect().top;
            draw();
        }
    }
}

function start() {
    document.getElementById("info").hidden = true;
    document.getElementById("game").hidden = false;
    const timer = document.getElementById("autosubmit");
    var end = Date.now() + 150000;
    var count = setInterval(function () {
        var now = new Date().getTime();
        var timeLeft = Math.ceil((end - now) / 1000);
        timer.innerHTML = "You have " + timeLeft + " seconds left.";
        if(timeLeft<0){
            clearInterval(count);
            submit();
        }
    }, 1000);
}

function toggleTimer() {
    time = 1 - time;
    if (time == 1) {
        document.getElementById("autosubmit").hidden = true;
    } else {
        document.getElementById("autosubmit").hidden = false;
    }
}

function submit() {
    document.getElementById("game").hidden = true;
    document.getElementById("after").hidden = false;
    ctxDraw.canvas.width = 400;
    ctxDraw.canvas.height = 400;
    let context = document.getElementById("final").getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    strokes.stroke(context);
}

function cancel() {
    document.getElementById("after").hidden = true;
    document.getElementById("cancel").hidden = false;
}

async function confirm() {
    document.getElementById("after").hidden = true;
    const canvData = strokes;
    const dataJSON = JSON.stringify(canvData);
    var compressed = dataJSON.compress();
    const picKey = window.picKey + "";
    const thisid = window.id + "";
    firebase.firestore().collection(picKey).doc(thisid).set({
        data: compressed,
        user: window.curUser.uid
    });
    const db = firebase.database();
    db.ref("avail/" + picKey+"/"+thisid).remove();
    document.getElementById("submitted").hidden = false;
}

function color(obj) {
    col = obj.id;
    document.getElementById('circle').style.background = col;
    if (col == "white") {
        document.getElementById('change').style.background = "rgb(210, 210, 210)";
    } else {
        document.getElementById('change').style.background = "rgb(231, 231, 231)";
    }

}

function size() {
    const circle = document.getElementById('circle');
    if (siz == 3) {
        siz = 17;
        circle.style.width = "13px";
        circle.style.height = "13px";
        circle.style.left = "7px";
        circle.style.top = "7px";
    } else if (siz == 17) {
        siz = 35;
        circle.style.width = "24px";
        circle.style.height = "24px";
        circle.style.left = "1px";
        circle.style.top = "1px";
    } else {
        siz = 3;
        circle.style.width = "7px";
        circle.style.height = "7px";
        circle.style.left = "10px";
        circle.style.top = "10px";
    }
}

function trash() {
    ctxDraw.canvas.width = ctxDraw.canvas.width + 1;
    ctxDraw.canvas.width = ctxDraw.canvas.width - 1;
    ctxDraw.fillStyle = "white";
    ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    strokes = null;
    strokes = new StrokeStore();
    resizeCanvas();
}

String.prototype.compress = function (asArray) {
	"use strict";
	// Build the dictionary.
	asArray = (asArray === true);
	var i,
		dictionary = {},
		uncompressed = this,
		c,
		wc,
		w = "",
		result = [],
		ASCII = '',
		dictSize = 256;
	for (i = 0; i < 256; i += 1) {
		dictionary[String.fromCharCode(i)] = i;
	}

	for (i = 0; i < uncompressed.length; i += 1) {
		c = uncompressed.charAt(i);
		wc = w + c;
		//Do not use dictionary[wc] because javascript arrays
		//will return values for array['pop'], array['push'] etc
	   // if (dictionary[wc]) {
		if (dictionary.hasOwnProperty(wc)) {
			w = wc;
		} else {
			result.push(dictionary[w]);
			ASCII += String.fromCharCode(dictionary[w]);
			// Add wc to the dictionary.
			dictionary[wc] = dictSize++;
			w = String(c);
		}
	}

	// Output the code for w.
	if (w !== "") {
		result.push(dictionary[w]);
		ASCII += String.fromCharCode(dictionary[w]);
	}
	return asArray ? result : ASCII;
};

String.prototype.decompress = function () {
	"use strict";
	// Build the dictionary.
	var i, tmp = [],
		dictionary = [],
		compressed = this,
		w,
		result,
		k,
		entry = "",
		dictSize = 256;
	for (i = 0; i < 256; i += 1) {
		dictionary[i] = String.fromCharCode(i);
	}

	if(compressed && typeof compressed === 'string') {
		// convert string into Array.
		for(i = 0; i < compressed.length; i += 1) {
			tmp.push(compressed[i].charCodeAt(0));
		}
		compressed = tmp;
		tmp = null;
	}

	w = String.fromCharCode(compressed[0]);
	result = w;
	for (i = 1; i < compressed.length; i += 1) {
		k = compressed[i];
		if (dictionary[k]) {
			entry = dictionary[k];
		} else {
			if (k === dictSize) {
				entry = w + w.charAt(0);
			} else {
				return null;
			}
		}

		result += entry;

		// Add w+entry[0] to the dictionary.
		dictionary[dictSize++] = w + entry.charAt(0);

		w = entry;
	}
	return result;
};