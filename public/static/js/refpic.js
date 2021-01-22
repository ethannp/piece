const canvasRef = document.getElementById("refpic");
const ctxRef = canvasRef.getContext("2d");
var imgURL;
var x=4;
var y=4;
$(function () {
    refPic();
});

function refPic(){
  if(firebase.apps.length === 0){
    setTimeout(refPic, 100);
    return;
}
  var storageRef = firebase.storage().ref("images/lisa.png");
  window.addEventListener('resize', resizePic, false);
  storageRef.getDownloadURL().then(function (url) {
    imgURL = url;
    resizePic();
  });
}

function resizePic() {
  if (window.innerWidth / 4 > 180 && window.innerWidth / 4 < 400) {
    ctxRef.canvas.width = window.innerWidth / 4;
    ctxRef.canvas.height = ctxRef.canvas.width;
  }
  if (window.innerWidth / 4 <= 180) {
    ctxRef.canvas.width = 180;
    ctxRef.canvas.height = 180;
  }
  if (window.innerWidth / 4 >= 400) {
    ctxRef.canvas.width = 400;
    ctxRef.canvas.height = 400;
  }
  scale = canvasDraw.width / 400;
  var img = new Image();
  img.addEventListener('load', function (e) {
    var h = img.height;
    var w = img.width;
    ctxRef.drawImage(this, x * (w/5), y * (w/5), w/5, h/5 ,0, 0, canvasRef.width, canvasRef.height);
  }, true);
  if (imgURL) {
    img.src = imgURL;
  }
}