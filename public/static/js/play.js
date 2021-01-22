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
    siz = 2;

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
    ctxDraw.beginPath();
    var color = "black";
    var size = 2;
    var count = 0;
    ctxDraw.lineCap='round';
    this.store.forEach(function (line) {
        scale = canvasDraw.width / 400;
        if (count == 0) {
            color = line[1].c;
            size = line[1].s;
            ctxDraw.strokeStyle = color;
            ctxDraw.lineWidth = size * scale;
        }
        if (color != line[1].color || size != line[1].size) {
            ctxDraw.stroke();
            color = line[1].c;
            size = line[1].s;
            ctxDraw.lineWidth = size * scale;
            ctxDraw.strokeStyle = color;
            ctxDraw.beginPath();
        }
        ctxDraw.moveTo(line[0].x * scale, line[0].y * scale);
        var pt;
        pt = line[1];
        ctxDraw.lineTo(pt.x * scale, pt.y * scale);
        count++;
    }, this);
    //this._stroke(this.current);
    ctxDraw.stroke();
};

var strokes = new StrokeStore();

$(function () {
    $('#start').click(start);
    $('#hidetimer').click(toggleTimer);
    $('#submit').click(submit);
    window.canv=-1;
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
    ctxDraw.lineCap='round';
    ctxDraw.lineWidth =siz * scale;
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
    var end = Date.now() + 120000;
    var count = setInterval(function () {
        var now = new Date().getTime();
        var timeLeft = Math.ceil((end - now) / 1000);
        timer.innerHTML = "Your piece will be autosubmitted in " + timeLeft + " seconds.";
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
    window.canv = strokes;
    document.getElementById("game").hidden = true;
}

function genUUID() {
    return ''+ Math.random().toString(36).substr(2, 10);
  };

function color(obj) {
    col = obj.id;
    document.getElementById('circle').style.background = col;
    if(col=="white"){
        document.getElementById('change').style.background = "rgb(210, 210, 210)";
    }
    else{
        document.getElementById('change').style.background = "rgb(231, 231, 231)";
    }

}

function size(){
    const circle = document.getElementById('circle');
    if(siz==2){
        siz=15;
        circle.style.width="13px";
        circle.style.height="13px";
        circle.style.left="7px";
        circle.style.top="7px";
    }
    else if(siz==15){
        siz=30;
        circle.style.width="24px";
        circle.style.height="24px";
        circle.style.left="1px";
        circle.style.top="1px";
    }
    else{
        siz=2;
        circle.style.width="7px";
        circle.style.height="7px";
        circle.style.left="10px";
        circle.style.top="10px";
    }
}

function trash(){
    ctxDraw.canvas.width = ctxDraw.canvas.width+1;
    ctxDraw.canvas.width = ctxDraw.canvas.width-1;
    ctxDraw.fillStyle = "white";
    ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    strokes = null;
    strokes = new StrokeStore();
    resizeCanvas();
}