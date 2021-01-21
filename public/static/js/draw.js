const canvasDraw = document.getElementById("canvDraw");
const ctxDraw = canvasDraw.getContext("2d");
var flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var data, scale;

var x = "black";

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

StrokeStore.prototype.lineTo = function (x, y) {
    this.current.push({
        x: x,
        y: y
    });
};

StrokeStore.prototype.stroke = function (ctx, style) {

    ctx.beginPath();
    ctx.strokeStyle = style ? style : 'black';
    this.store.forEach(function (line) {
        this._stroke(line);
    }, this);
    this._stroke(this.current);
    ctx.stroke();
};

StrokeStore.prototype._stroke = function (line) {
    var length = line.length;
    if (length < 2) {
        return;
    }
    ctxDraw.lineWidth = 2;
    scale = canvasDraw.width / 300;
    ctxDraw.moveTo(line[0].x * scale, line[0].y * scale);
    var index, pt;
    for (index = 1; index < length; ++index) {
        pt = line[index];
        ctxDraw.lineTo(pt.x * scale, pt.y * scale);
    }
};

var strokes = new StrokeStore();

$(function () {
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
    if (window.innerWidth / 4 > 180 && window.innerWidth / 4 < 300) {
        ctxDraw.canvas.width = window.innerWidth / 4;
        ctxDraw.canvas.height = ctxDraw.canvas.width;
    }
    if (window.innerWidth / 4 <= 180) {
        ctxDraw.canvas.width = 180;
        ctxDraw.canvas.height = 180;
    }
    if (window.innerWidth / 4 >= 300) {
        ctxDraw.canvas.width = 300;
        ctxDraw.canvas.height = 300;
    }
    redraw();
}

function redraw() {
    ctxDraw.fillStyle = "white";
    ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    strokes.stroke(ctxDraw, "black");
}

function draw() {
    ctxDraw.beginPath();
    ctxDraw.moveTo(prevX, prevY);
    ctxDraw.lineTo(currX, currY);
    ctxDraw.strokeStyle = x;
    ctxDraw.lineWidth = 2;
    ctxDraw.stroke();
    ctxDraw.closePath();
    scale = 300 / canvasDraw.width;
    strokes.moveTo(prevX * scale, prevY * scale);
    strokes.lineTo(currX * scale, currY * scale);
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
            ctxDraw.fillStyle = x;
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