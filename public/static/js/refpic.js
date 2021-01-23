const canvasRef = document.getElementById("refpic");
const ctxRef = canvasRef.getContext("2d");
var imgURL;
var id = 5;
$(function () {
  fbwait();
});

function fbwait() {
  if (firebase.apps.length === 0) {
    setTimeout(fbwait, 100);
    return;
  } //wait until firebase is init
  refPic();
}

function loadDB() {
  const db = firebase.database();
  let pics = [];

  return new Promise(async function (resolve, reject) {
    const snap = await db.ref("avail/").once("value");
    snap.forEach(function (childSnap) {
      pics.push({
        key: childSnap.key,
        avail: childSnap.val()
      });
    });
    resolve(pics);
  });
}

const getPic = async (pid) => {
  const db = firebase.database();
  const snap = await db.ref("pieces/" + pid).once("value");
  return snap.node_.value_;
}

async function refPic() {
  let allpics = await loadDB();
  let chosen = allpics[Math.floor(Math.random() * allpics.length)];
  let name = await getPic(chosen.key);
  window.picKey = chosen.key;
  window.id = id;
  var storageRef = firebase.storage().ref("images/" + name);
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
    ctxRef.drawImage(img, Math.floor(id / 5) * (w / 5), (id % 5) * (h / 5), w / 5, h / 5, 0, 0,canvasRef.width, canvasRef.height);
  }, true);
  if (imgURL) {
    img.src = imgURL;
  }
}